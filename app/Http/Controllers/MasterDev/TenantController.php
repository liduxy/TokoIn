<?php

namespace App\Http\Controllers\MasterDev;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::withCount(['users', 'officeLocations', 'attendances'])
            ->orderBy('name')
            ->get();

        return Inertia::render('MasterDev/Tenants/Index', [
            'tenants' => $tenants,
            'stats' => [
                'total_tenants' => Tenant::count(),
                'total_users' => User::whereNotNull('tenant_id')->count(),
                'total_attendances' => Attendance::count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('MasterDev/Tenants/Form', [
            'tenant' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $tenant = Tenant::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?: Str::slug($data['name']),
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Create owner user along with the tenant
        if (! empty($data['owner_email'])) {
            User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['owner_name'],
                'email' => $data['owner_email'],
                'password' => Hash::make($data['owner_password']),
                'role' => User::ROLE_OWNER,
            ]);
        }

        return redirect()->route('master.tenants.index')->with('success', 'Toko & owner dibuat.');
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('MasterDev/Tenants/Form', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => ['required', 'string', 'max:120', Rule::unique('tenants', 'slug')->ignore($tenant->id)],
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $tenant->update($data);

        return redirect()->route('master.tenants.index')->with('success', 'Toko diperbarui.');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $tenant->delete();

        return redirect()->route('master.tenants.index')->with('success', 'Toko dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'nullable|string|max:120|unique:tenants,slug',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'owner_name' => 'required_with:owner_email|string|max:120',
            'owner_email' => 'nullable|email|max:191|unique:users,email',
            'owner_password' => 'required_with:owner_email|min:6',
        ]);
    }
}
