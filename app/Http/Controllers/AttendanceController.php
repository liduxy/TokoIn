<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\OfficeLocation;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();
        $todayShifts = $this->todayShifts($user->tenant_id, $user->id, $today);

        $todayAttendances = Attendance::with('officeLocation:id,name')
            ->where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->orderBy('created_at')
            ->get();

        $checkInAttendances = $todayAttendances->where('type', Attendance::TYPE_CHECK_IN);
        $checkedInShiftIds = $checkInAttendances->pluck('shift_id')->filter()->values();
        $remainingShifts = $todayShifts->whereNotIn('id', $checkedInShiftIds->all())->values();
        $nextCheckInShift = $remainingShifts->sortBy('shift_start')->first();

        $hasCheckIn = $checkInAttendances->isNotEmpty();
        $hasCheckOut = $todayAttendances->firstWhere('type', Attendance::TYPE_CHECK_OUT);

        $lastShift = $todayShifts->sortBy('shift_end')->last();
        $lastShiftEnd = $lastShift ? $this->shiftTimeOnDate($lastShift->shift_end, $today) : null;

        $now = Carbon::now();
        $isWorkDay = $todayShifts->isNotEmpty();
        $canCheckOutByTime = $lastShiftEnd ? $now->greaterThanOrEqualTo($lastShiftEnd) : false;
        $allShiftsCheckedIn = $todayShifts->isNotEmpty() && $remainingShifts->isEmpty();
        $canCheckOut = $isWorkDay && $allShiftsCheckedIn && $canCheckOutByTime;
        $nextType = (! $allShiftsCheckedIn || ! $hasCheckIn) ? Attendance::TYPE_CHECK_IN : Attendance::TYPE_CHECK_OUT;

        $selectedOffice = $nextType === Attendance::TYPE_CHECK_IN
            ? ($nextCheckInShift?->officeLocation)
            : ($lastShift?->officeLocation);

        $willBeLate = false;
        if ($nextType === Attendance::TYPE_CHECK_IN && $nextCheckInShift && $selectedOffice) {
            $deadline = $this->shiftTimeOnDate($nextCheckInShift->shift_start, $today)
                ->addMinutes((int) $selectedOffice->late_tolerance_minutes);
            $willBeLate = $now->greaterThan($deadline);
        }

        return Inertia::render('Attendance/Index', [
            'office' => $selectedOffice ? [
                'id' => $selectedOffice->id,
                'name' => $selectedOffice->name,
                'address' => $selectedOffice->address,
                'latitude' => $selectedOffice->latitude,
                'longitude' => $selectedOffice->longitude,
                'radius_meters' => $selectedOffice->radius_meters,
                'work_start_time' => $selectedOffice->formatTime('work_start_time'),
                'work_end_time' => $selectedOffice->formatTime('work_end_time'),
                'late_tolerance_minutes' => $selectedOffice->late_tolerance_minutes,
                'work_days' => $selectedOffice->workDaysArray(),
                'work_day_names' => $selectedOffice->workDayNames(),
            ] : null,
            'today_shifts' => $todayShifts->map(fn ($shift) => [
                'id' => $shift->id,
                'start' => $shift->shift_start->format('H:i'),
                'end' => $shift->shift_end->format('H:i'),
                'location_name' => $shift->officeLocation?->name,
                'checked_in' => $checkedInShiftIds->contains($shift->id),
            ])->values(),
            'next_shift_id' => $nextCheckInShift?->id,
            'remaining_check_in_count' => $remainingShifts->count(),
            'today_attendances' => $todayAttendances->map(fn ($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'time' => $a->created_at->format('H:i:s'),
                'distance_meters' => $a->distance_meters,
                'is_late' => $a->is_late,
                'note' => $a->note,
                'photo_url' => Storage::url($a->photo_path),
            ])->values(),
            'next_type' => $nextType,
            'has_check_in' => (bool) $hasCheckIn,
            'has_check_out' => (bool) $hasCheckOut,
            'is_work_day' => $isWorkDay,
            'will_be_late' => $willBeLate,
            'can_check_out' => $canCheckOut,
            'now_iso' => $now->toIso8601String(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => 'required|in:check_in,check_out',
            'shift_id' => 'nullable|integer|exists:shifts,id',
            'photo' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'note' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $today = Carbon::today();
        $todayShifts = $this->todayShifts($user->tenant_id, $user->id, $today);

        if ($todayShifts->isEmpty()) {
            return back()->with('error', 'Anda tidak memiliki jadwal shift hari ini, jadi tidak bisa absen.');
        }

        $now = Carbon::now();
        $checkInAttendances = Attendance::where('user_id', $user->id)
            ->where('type', Attendance::TYPE_CHECK_IN)
            ->whereDate('created_at', $today)
            ->get();
        $checkedInShiftIds = $checkInAttendances->pluck('shift_id')->filter()->values();

        $isLate = false;
        $targetShift = null;
        $targetOffice = null;

        if ($data['type'] === Attendance::TYPE_CHECK_IN) {
            $shiftId = $data['shift_id'] ?? null;
            if (! $shiftId) {
                return back()->with('error', 'Shift wajib dipilih untuk absen masuk.');
            }

            $targetShift = $todayShifts->firstWhere('id', (int) $shiftId);
            if (! $targetShift) {
                return back()->with('error', 'Shift tidak valid untuk hari ini.');
            }

            if ($checkedInShiftIds->contains($targetShift->id)) {
                return back()->with('error', 'Anda sudah check-in untuk shift ini.');
            }

            $firstUncheckedShift = $todayShifts
                ->whereNotIn('id', $checkedInShiftIds->all())
                ->sortBy('shift_start')
                ->first();

            if ($firstUncheckedShift && $firstUncheckedShift->id !== $targetShift->id) {
                return back()->with('error', 'Check-in harus sesuai urutan shift.');
            }

            $targetOffice = $targetShift->officeLocation;
            if (! $targetOffice || ! $targetOffice->is_active) {
                return back()->with('error', 'Lokasi shift tidak aktif.');
            }

            $deadline = $this->shiftTimeOnDate($targetShift->shift_start, $today)
                ->addMinutes((int) $targetOffice->late_tolerance_minutes);
            $isLate = $now->greaterThan($deadline);

            if ($isLate && empty(trim((string) ($data['note'] ?? '')))) {
                return back()
                    ->withInput()
                    ->with(
                        'error',
                        'Anda terlambat untuk shift ini. Wajib mengisi alasan keterlambatan.'
                    );
            }
        }

        if ($data['type'] === Attendance::TYPE_CHECK_OUT) {
            $hasCheckOut = Attendance::where('user_id', $user->id)
                ->where('type', Attendance::TYPE_CHECK_OUT)
                ->whereDate('created_at', $today)
                ->exists();

            if ($hasCheckOut) {
                return back()->with('error', 'Anda sudah absen pulang hari ini.');
            }

            if ($checkedInShiftIds->count() < $todayShifts->count()) {
                return back()->with('error', 'Anda harus check-in semua shift hari ini sebelum absen pulang.');
            }

            $lastShift = $todayShifts->sortBy('shift_end')->last();
            $targetOffice = $lastShift?->officeLocation;

            if (! $lastShift || ! $targetOffice || ! $targetOffice->is_active) {
                return back()->with('error', 'Shift terakhir atau lokasi shift tidak valid.');
            }

            $lastShiftEnd = $this->shiftTimeOnDate($lastShift->shift_end, $today);
            if ($now->lt($lastShiftEnd)) {
                return back()->with('error', 'Belum waktunya pulang. Jam pulang shift terakhir: '.$lastShift->shift_end->format('H:i').'.');
            }

            $targetShift = $lastShift;
        }

        if (! $targetOffice) {
            return back()->with('error', 'Lokasi untuk absen tidak ditemukan.');
        }

        $distance = OfficeLocation::haversine(
            (float) $data['latitude'],
            (float) $data['longitude'],
            (float) $targetOffice->latitude,
            (float) $targetOffice->longitude
        );

        if ($distance > $targetOffice->radius_meters) {
            return back()->with(
                'error',
                "Anda di luar radius kantor ({$distance}m, batas {$targetOffice->radius_meters}m)."
            );
        }

        $photoPath = $this->savePhoto($data['photo'], $user->id);
        if (! $photoPath) {
            return back()->with('error', 'Format foto tidak valid.');
        }

        Attendance::create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'office_location_id' => $targetOffice->id,
            'shift_id' => $targetShift?->id,
            'type' => $data['type'],
            'photo_path' => $photoPath,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'distance_meters' => $distance,
            'is_late' => $isLate,
            'note' => $data['note'] ?? null,
        ]);

        return redirect()
            ->route('attendance.index')
            ->with('success', 'Absen '.($data['type'] === Attendance::TYPE_CHECK_IN ? 'masuk' : 'pulang').' berhasil dicatat.');
    }

    public function history(Request $request): Response
    {
        $user = $request->user();

        $attendances = Attendance::with('officeLocation:id,name')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $items = $attendances->map(fn ($a) => [
            'id' => $a->id,
            'date' => $a->created_at->format('d M Y'),
            'time' => $a->created_at->format('H:i:s'),
            'type' => $a->type,
            'is_late' => $a->is_late,
            'note' => $a->note,
            'distance_meters' => $a->distance_meters,
            'latitude' => $a->latitude,
            'longitude' => $a->longitude,
            'photo_url' => Storage::url($a->photo_path),
            'office_name' => $a->officeLocation?->name,
        ])->values();

        return Inertia::render('Attendance/History', [
            'attendances' => [
                'data' => $items,
                'links' => $attendances->linkCollection(),
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
            ],
        ]);
    }

    private function savePhoto(string $base64, int $userId): ?string
    {
        if (! preg_match('/^data:image\/(jpeg|jpg|png);base64,(.+)$/', $base64, $m)) {
            return null;
        }

        $ext = $m[1] === 'jpg' ? 'jpeg' : $m[1];
        $binary = base64_decode($m[2], true);
        if ($binary === false) {
            return null;
        }

        $filename = 'attendances/'.$userId.'/'.date('Ymd_His').'_'.Str::random(8).'.'.$ext;
        Storage::disk('public')->put($filename, $binary);

        return $filename;
    }

    private function todayShifts(int $tenantId, int $userId, Carbon $date)
    {
        return Shift::with('officeLocation')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->whereDate('shift_date', $date->toDateString())
            ->whereIn('status', [Shift::STATUS_ASSIGNED, Shift::STATUS_CONFIRMED, Shift::STATUS_COMPLETED])
            ->orderBy('shift_start')
            ->get();
    }

    private function shiftTimeOnDate($time, Carbon $date): Carbon
    {
        if ($time instanceof Carbon) {
            return $date->copy()->setTime($time->hour, $time->minute, 0);
        }

        [$h, $m] = array_pad(explode(':', (string) $time), 2, '0');
        return $date->copy()->setTime((int) $h, (int) $m, 0);
    }
}
