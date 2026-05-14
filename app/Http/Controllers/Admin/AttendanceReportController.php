<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceReportController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $filters = [
            'user_id' => $request->integer('user_id') ?: null,
            'type' => in_array($request->string('type')->toString(), ['check_in', 'check_out'], true)
                ? $request->string('type')->toString()
                : null,
            'date_from' => $request->date('date_from')?->format('Y-m-d'),
            'date_to' => $request->date('date_to')?->format('Y-m-d'),
        ];

        $query = Attendance::with(['user:id,name,employee_id,role', 'officeLocation:id,name'])
            ->where('tenant_id', $tenantId)
            ->orderByDesc('created_at');

        if ($filters['user_id']) $query->where('user_id', $filters['user_id']);
        if ($filters['type']) $query->where('type', $filters['type']);
        if ($filters['date_from']) $query->whereDate('created_at', '>=', $filters['date_from']);
        if ($filters['date_to']) $query->whereDate('created_at', '<=', $filters['date_to']);

        $page = $query->paginate(20)->withQueryString();

        $items = $page->map(fn ($a) => [
            'id' => $a->id,
            'date' => $a->created_at->format('d M Y'),
            'time' => $a->created_at->format('H:i:s'),
            'user' => [
                'id' => $a->user?->id,
                'name' => $a->user?->name ?? '-',
                'employee_id' => $a->user?->employee_id,
                'role' => $a->user?->role,
            ],
            'type' => $a->type,
            'is_late' => $a->is_late,
            'note' => $a->note,
            'distance_meters' => $a->distance_meters,
            'latitude' => $a->latitude,
            'longitude' => $a->longitude,
            'photo_url' => Storage::url($a->photo_path),
            'office_name' => $a->officeLocation?->name,
        ])->values();

        return Inertia::render('Admin/AttendanceReport', [
            'attendances' => [
                'data' => $items,
                'links' => $page->linkCollection(),
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
            ],
            'users' => User::where('tenant_id', $tenantId)
                ->orderBy('name')
                ->get(['id', 'name', 'role']),
            'filters' => $filters,
            'stats' => [
                'today' => Attendance::where('tenant_id', $tenantId)
                    ->whereDate('created_at', Carbon::today())->count(),
                'this_month' => Attendance::where('tenant_id', $tenantId)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)->count(),
                'late_this_month' => Attendance::where('tenant_id', $tenantId)
                    ->where('is_late', true)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)->count(),
                'total_users' => User::where('tenant_id', $tenantId)
                    ->whereIn('role', [User::ROLE_WAITERS, User::ROLE_KASIR, User::ROLE_ADMIN])->count(),
            ],
        ]);
    }
}

