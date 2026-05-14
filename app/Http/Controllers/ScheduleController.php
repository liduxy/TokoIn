<?php

namespace App\Http\Controllers;

use App\Models\OfficeLocation;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();
        $end = $today->copy()->addDays(6);

        $office = OfficeLocation::where('tenant_id', $user->tenant_id)
            ->where('is_active', true)
            ->first();

        $shifts = Shift::with('officeLocation:id,name')
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->whereDate('shift_date', '>=', $today->toDateString())
            ->whereDate('shift_date', '<=', $end->toDateString())
            ->whereIn('status', [Shift::STATUS_ASSIGNED, Shift::STATUS_CONFIRMED, Shift::STATUS_COMPLETED])
            ->orderBy('shift_date')
            ->orderBy('shift_start')
            ->get()
            ->groupBy(fn ($s) => $s->shift_date->toDateString());

        $upcoming = collect(range(0, 6))->map(function (int $offset) use ($today, $shifts) {
            $date = $today->copy()->addDays($offset);
            $dayShifts = $shifts->get($date->toDateString(), collect());

            return [
                'date_iso' => $date->toDateString(),
                'date_label' => $date->format('d M Y'),
                'iso_weekday' => $date->isoWeekday(),
                'is_work_day' => $dayShifts->isNotEmpty(),
                'shifts' => $dayShifts->map(fn ($s) => [
                    'id' => $s->id,
                    'start' => $s->shift_start->format('H:i'),
                    'end' => $s->shift_end->format('H:i'),
                    'status' => $s->status,
                    'location_name' => $s->officeLocation?->name,
                    'note' => $s->note,
                ])->values(),
            ];
        });

        return Inertia::render('Schedule/Index', [
            'office' => $office ? [
                'name' => $office->name,
                'address' => $office->address,
                'work_start_time' => $office->formatTime('work_start_time'),
                'work_end_time' => $office->formatTime('work_end_time'),
                'late_tolerance_minutes' => $office->late_tolerance_minutes,
                'work_days' => $office->workDaysArray(),
                'work_day_names' => $office->workDayNames(),
                'radius_meters' => $office->radius_meters,
            ] : null,
            'day_labels' => OfficeLocation::dayLabels(),
            'upcoming' => $upcoming,
            'today_iso' => $today->toDateString(),
        ]);
    }
}
