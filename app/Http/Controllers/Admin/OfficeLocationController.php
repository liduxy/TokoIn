<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficeLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfficeLocationController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $locations = OfficeLocation::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'address' => $l->address,
                'latitude' => $l->latitude,
                'longitude' => $l->longitude,
                'radius_meters' => $l->radius_meters,
                'is_active' => $l->is_active,
                'work_start_time' => $l->formatTime('work_start_time'),
                'work_end_time' => $l->formatTime('work_end_time'),
                'late_tolerance_minutes' => $l->late_tolerance_minutes,
                'work_days' => $l->workDaysArray(),
                'work_day_names' => $l->workDayNames(),
            ]);

        return Inertia::render('Admin/Offices/Index', [
            'locations' => $locations,
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Offices/Form', [
            'location' => null,
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['tenant_id'] = $request->user()->tenant_id;
        OfficeLocation::create($data);

        return redirect()->route('admin.offices.index')->with('success', 'Lokasi kantor ditambahkan.');
    }

    public function edit(Request $request, OfficeLocation $office): Response
    {
        $this->authorizeAccess($request, $office);

        return Inertia::render('Admin/Offices/Form', [
            'location' => [
                'id' => $office->id,
                'name' => $office->name,
                'address' => $office->address,
                'latitude' => $office->latitude,
                'longitude' => $office->longitude,
                'radius_meters' => $office->radius_meters,
                'is_active' => $office->is_active,
                'work_start_time' => $office->formatTime('work_start_time'),
                'work_end_time' => $office->formatTime('work_end_time'),
                'late_tolerance_minutes' => $office->late_tolerance_minutes,
                'work_days' => $office->workDaysArray(),
            ],
            'day_labels' => OfficeLocation::dayLabels(),
        ]);
    }

    public function update(Request $request, OfficeLocation $office): RedirectResponse
    {
        $this->authorizeAccess($request, $office);

        $office->update($this->validated($request));

        return redirect()->route('admin.offices.index')->with('success', 'Lokasi kantor diperbarui.');
    }

    public function destroy(Request $request, OfficeLocation $office): RedirectResponse
    {
        $this->authorizeAccess($request, $office);
        $office->delete();

        return redirect()->route('admin.offices.index')->with('success', 'Lokasi kantor dihapus.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'address' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:10000',
            'is_active' => 'sometimes|boolean',
            'work_start_time' => 'required|date_format:H:i',
            'work_end_time' => 'required|date_format:H:i|after:work_start_time',
            'late_tolerance_minutes' => 'required|integer|min:0|max:240',
            'work_days' => 'required|array|min:1',
            'work_days.*' => 'integer|between:1,7',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['work_days'] = collect($data['work_days'])->unique()->sort()->values()->implode(',');

        return $data;
    }

    private function authorizeAccess(Request $request, OfficeLocation $office): void
    {
        if ($office->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }
    }
}
