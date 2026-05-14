<?php

namespace Tests\Feature;

use App\Models\OfficeLocation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MultiTenantTest extends TestCase
{
    use RefreshDatabase;

    private function makeTenantWithOwner(string $slug = 'shop-a'): array
    {
        $tenant = Tenant::create([
            'name' => 'Shop '.$slug,
            'slug' => $slug,
            'is_active' => true,
        ]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Owner '.$slug,
            'email' => "owner.$slug@test.local",
            'password' => Hash::make('password'),
            'role' => User::ROLE_OWNER,
        ]);

        $office = OfficeLocation::create([
            'tenant_id' => $tenant->id,
            'name' => 'Lokasi',
            'latitude' => -6.2,
            'longitude' => 106.8,
            'radius_meters' => 100,
            'is_active' => true,
            'work_start_time' => '08:00:00',
            'work_end_time' => '17:00:00',
            'late_tolerance_minutes' => 15,
            'work_days' => '1,2,3,4,5',
        ]);

        return [$tenant, $owner, $office];
    }

    public function test_master_dev_can_access_tenants(): void
    {
        $master = User::create([
            'tenant_id' => null,
            'name' => 'Master',
            'email' => 'master@test.local',
            'password' => Hash::make('password'),
            'role' => User::ROLE_MASTER_DEV,
        ]);

        $this->actingAs($master)
            ->get(route('master.tenants.index'))
            ->assertOk();
    }

    public function test_owner_cannot_access_master_routes(): void
    {
        [, $owner] = $this->makeTenantWithOwner();
        $this->actingAs($owner)
            ->get(route('master.tenants.index'))
            ->assertForbidden();
    }

    public function test_waiters_cannot_access_admin_dashboard(): void
    {
        [$tenant] = $this->makeTenantWithOwner();
        $waiter = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Waiter',
            'email' => 'w@test.local',
            'password' => Hash::make('password'),
            'role' => User::ROLE_WAITERS,
        ]);

        $this->actingAs($waiter)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    public function test_admin_only_sees_own_tenant_users(): void
    {
        [, $ownerA] = $this->makeTenantWithOwner('a');
        [$tenantB] = $this->makeTenantWithOwner('b');
        User::create([
            'tenant_id' => $tenantB->id,
            'name' => 'Other',
            'email' => 'other@test.local',
            'password' => Hash::make('password'),
            'role' => User::ROLE_WAITERS,
        ]);

        $this->actingAs($ownerA)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->component('Admin/Users/Index')
                ->has('users', 1));
    }

    public function test_dashboard_redirects_by_role(): void
    {
        [, $owner] = $this->makeTenantWithOwner();
        $this->actingAs($owner)
            ->get(route('dashboard'))
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_attendance_index_renders_for_waiters(): void
    {
        [$tenant] = $this->makeTenantWithOwner();
        $waiter = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Waiter',
            'email' => 'w2@test.local',
            'password' => Hash::make('password'),
            'role' => User::ROLE_WAITERS,
        ]);

        $this->actingAs($waiter)
            ->get(route('attendance.index'))
            ->assertOk();
    }

    public function test_haversine_calculates_distance(): void
    {
        $d = OfficeLocation::haversine(-6.2, 106.8, -6.21, 106.81);
        $this->assertGreaterThan(1000, $d);
        $this->assertLessThan(2000, $d);
    }
}
