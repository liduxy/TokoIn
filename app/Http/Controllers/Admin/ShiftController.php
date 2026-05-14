<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficeLocation;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        
        $query = Shift::with(['user:id,name,employee_id,role', 'officeLocation:id,name'])
            ->where('tenant_id', $tenantId)
            ->orderBy('shift_date')
            ->orderBy('shift_start');

        // Filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('office_location_id')) {
            $query->where('office_location_id', $request->office_location_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('shift_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('shift_date', '<=', $request->date_to);
        }

        $shifts = $query->paginate(50)->withQueryString()->through(fn($shift) => [
            'id' => $shift->id,
            'shift_date' => $shift->shift_date->format('Y-m-d'),
            'shift_start' => $shift->shift_start->format('H:i'),
            'shift_end' => $shift->shift_end->format('H:i'),
            'duration_minutes' => $shift->duration_minutes,
            'status' => $shift->status,
            'note' => $shift->note,
            'user' => $shift->user ? [
                'id' => $shift->user->id,
                'name' => $shift->user->name,
                'employee_id' => $shift->user->employee_id,
                'role' => $shift->user->role,
            ] : null,
            'office_location' => $shift->officeLocation ? [
                'id' => $shift->officeLocation->id,
                'name' => $shift->officeLocation->name,
            ] : null,
        ]);

        $employees = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['waiters', 'kasir', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'employee_id', 'role']);

        $locations = OfficeLocation::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'work_start_time', 'work_end_time', 'work_days']);

        return Inertia::render('Admin/Shifts/Index', [
            'shifts' => $shifts,
            'employees' => $employees,
            'locations' => $locations,
            'filters' => $request->only(['user_id', 'office_location_id', 'date_from', 'date_to']),
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function create(): Response
    {
        $tenantId = request()->user()->tenant_id;
        
        $employees = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['waiters', 'kasir', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'employee_id', 'role']);

        $locations = OfficeLocation::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'work_start_time', 'work_end_time', 'work_days']);

        return Inertia::render('Admin/Shifts/Form', [
            'shift' => null,
            'employees' => $employees,
            'locations' => $locations,
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateShift($request);
        $data['tenant_id'] = $request->user()->tenant_id;

        Shift::create($data);
        return redirect()->route('admin.shifts.index')->with('success', 'Shift berhasil ditambahkan.');
    }

    public function edit(Request $request, Shift $shift): Response
    {
        $this->authorizeAccess($request, $shift);

        $tenantId = $request->user()->tenant_id;
        
        $employees = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['waiters', 'kasir', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'employee_id', 'role']);

        $locations = OfficeLocation::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'work_start_time', 'work_end_time', 'work_days']);

        return Inertia::render('Admin/Shifts/Form', [
            'shift' => [
                'id' => $shift->id,
                'user_id' => $shift->user_id,
                'office_location_id' => $shift->office_location_id,
                'shift_date' => $shift->shift_date->format('Y-m-d'),
                'shift_start' => $shift->shift_start->format('H:i'),
                'shift_end' => $shift->shift_end->format('H:i'),
                'status' => $shift->status,
                'note' => $shift->note,
            ],
            'employees' => $employees,
            'locations' => $locations,
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        $this->authorizeAccess($request, $shift);
        
        $data = $this->validateShift($request, $shift->id);

        $shift->update($data);
        return redirect()->route('admin.shifts.index')->with('success', 'Shift diperbarui.');
    }

    public function destroy(Request $request, Shift $shift): RedirectResponse
    {
        $this->authorizeAccess($request, $shift);
        $shift->delete();
        return redirect()->route('admin.shifts.index')->with('success', 'Shift dihapus.');
    }

    public function bulkAssign(Request $request): RedirectResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'office_location_id' => 'required|exists:office_locations,id',
            'date_from' => 'required|date|after_or_equal:today',
            'date_to' => 'required|date|after_or_equal:date_from',
            'shift_start' => 'required|date_format:H:i',
            'shift_end' => 'required|date_format:H:i|after:shift_start',
            'status' => 'in:assigned,confirmed',
            'note' => 'nullable|string|max:255',
        ]);

        $tenantId = $request->user()->tenant_id;
        $location = OfficeLocation::where('tenant_id', $tenantId)
            ->findOrFail($request->office_location_id);

        $assigned = 0;
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->startOfDay();

        foreach ($request->user_ids as $userId) {
            // Check if user belongs to tenant
            $user = User::where('tenant_id', $tenantId)->find($userId);
            if (!$user) continue;

            for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
                $duplicate = Shift::where('tenant_id', $tenantId)
                    ->where('user_id', $userId)
                    ->whereDate('shift_date', $date->toDateString())
                    ->where('shift_start', $request->shift_start)
                    ->exists();

                if ($duplicate) {
                    continue;
                }

                Shift::create([
                    'tenant_id' => $tenantId,
                    'office_location_id' => $request->office_location_id,
                    'user_id' => $userId,
                    'shift_date' => $date->toDateString(),
                    'shift_start' => $request->shift_start,
                    'shift_end' => $request->shift_end,
                    'status' => $request->status ?? Shift::STATUS_ASSIGNED,
                    'note' => $request->note,
                ]);
                $assigned++;
            }
        }

        $message = "Berhasil menetapkan {$assigned} shift dalam rentang tanggal.";

        return redirect()->route('admin.shifts.index')->with('success', $message);
    }

    private function validateShift(Request $request, ?int $shiftId = null): array
    {
        return $request->validate([
            'user_id' => 'required|exists:users,id',
            'office_location_id' => 'required|exists:office_locations,id',
            'shift_date' => 'required|date|after_or_equal:today',
            'shift_start' => 'required|date_format:H:i',
            'shift_end' => 'required|date_format:H:i|after:shift_start',
            'status' => 'in:assigned,confirmed,completed,cancelled',
            'note' => 'nullable|string|max:255',
        ]);
    }

    private function authorizeAccess(Request $request, Shift $shift): void
    {
        if ($shift->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }
    }
}
