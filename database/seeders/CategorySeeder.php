<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        $categories = [
            ['name' => 'Makanan', 'color' => '#ef4444', 'sort_order' => 1],
            ['name' => 'Minuman', 'color' => '#3b82f6', 'sort_order' => 2],
            ['name' => 'Snack', 'color' => '#f59e0b', 'sort_order' => 3],
            ['name' => 'Rokok', 'color' => '#6b7280', 'sort_order' => 4],
            ['name' => 'Lainnya', 'color' => '#6366f1', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'tenant_id' => $tenant->id,
                ...$cat,
            ]);
        }
    }
}