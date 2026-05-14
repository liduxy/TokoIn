<?php

namespace Database\Seeders;

use App\Models\OfficeLocation;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Master dev (lintas toko)
        User::updateOrCreate(
            ['email' => 'devops@tokoin.test'],
            [
                'tenant_id' => null,
                'name' => 'Master Dev',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MASTER_DEV,
            ]
        );

        // Toko 1: Bakso Pak Joko
        $this->seedTenant(
            slug: 'bakso-pak-joko',
            name: 'Bakso Pak Joko',
            address: 'Jl. Mawar No. 12, Bandung',
            phone: '08123456789',
            officeLat: -6.9147,
            officeLng: 107.6098,
            users: [
                ['joko@tokoin.test', 'Pak Joko', User::ROLE_OWNER],
                ['admin.bakso@tokoin.test', 'Admin Bakso', User::ROLE_ADMIN],
                ['kasir.bakso@tokoin.test', 'Kasir Bakso', User::ROLE_KASIR],
                ['budi@tokoin.test', 'Budi Waiters', User::ROLE_WAITERS],
                ['siti@tokoin.test', 'Siti Waiters', User::ROLE_WAITERS],
            ]
        );

        // Toko 2: Toko Kelontong Berkah
        $this->seedTenant(
            slug: 'kelontong-berkah',
            name: 'Toko Kelontong Berkah',
            address: 'Jl. Melati No. 5, Surabaya',
            phone: '08987654321',
            officeLat: -7.2575,
            officeLng: 112.7521,
            users: [
                ['ibu.berkah@tokoin.test', 'Ibu Berkah', User::ROLE_OWNER],
                ['admin.berkah@tokoin.test', 'Admin Berkah', User::ROLE_ADMIN],
                ['kasir.berkah@tokoin.test', 'Kasir Berkah', User::ROLE_KASIR],
                ['agus@tokoin.test', 'Agus Waiters', User::ROLE_WAITERS],
            ]
        );
    }

    /**
     * @param  array<int, array{0: string, 1: string, 2: string}>  $users
     */
    private function seedTenant(
        string $slug,
        string $name,
        string $address,
        string $phone,
        float $officeLat,
        float $officeLng,
        array $users,
    ): void {
        $tenant = Tenant::updateOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'address' => $address,
                'phone' => $phone,
                'is_active' => true,
            ]
        );

        OfficeLocation::updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Lokasi Utama'],
            [
                'address' => $address,
                'latitude' => $officeLat,
                'longitude' => $officeLng,
                'radius_meters' => 150,
                'is_active' => true,
                'work_start_time' => '08:00:00',
                'work_end_time' => '17:00:00',
                'late_tolerance_minutes' => 15,
                'work_days' => '1,2,3,4,5',
            ]
        );

        foreach ($users as [$email, $userName, $role]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $userName,
                    'password' => Hash::make('password'),
                    'role' => $role,
                ]
            );
        }
    }
}
