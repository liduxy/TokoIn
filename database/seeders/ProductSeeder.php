<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        $categories = Category::where('tenant_id', $tenant->id)->get()->keyBy('name');

        $products = [
            // Makanan
            ['name' => 'Nasi Goreng', 'category' => 'Makanan', 'sku' => 'FD001', 'price' => 15000, 'track_stock' => false],
            ['name' => 'Mie Goreng', 'category' => 'Makanan', 'sku' => 'FD002', 'price' => 12000, 'track_stock' => false],
            ['name' => 'Ayam Goreng', 'category' => 'Makanan', 'sku' => 'FD003', 'price' => 18000, 'track_stock' => false],
            ['name' => 'Soto Ayam', 'category' => 'Makanan', 'sku' => 'FD004', 'price' => 15000, 'track_stock' => false],

            // Minuman
            ['name' => 'Es Teh Manis', 'category' => 'Minuman', 'sku' => 'DR001', 'price' => 5000, 'track_stock' => false],
            ['name' => 'Es Jeruk', 'category' => 'Minuman', 'sku' => 'DR002', 'price' => 7000, 'track_stock' => false],
            ['name' => 'Kopi Hitam', 'category' => 'Minuman', 'sku' => 'DR003', 'price' => 5000, 'track_stock' => false],
            ['name' => 'Air Mineral', 'category' => 'Minuman', 'sku' => 'DR004', 'price' => 4000, 'track_stock' => true, 'stock' => 50],

            // Snack
            ['name' => 'Keripik Kentang', 'category' => 'Snack', 'sku' => 'SN001', 'price' => 8000, 'track_stock' => true, 'stock' => 30],
            ['name' => 'Coklat Batang', 'category' => 'Snack', 'sku' => 'SN002', 'price' => 10000, 'track_stock' => true, 'stock' => 20],
            ['name' => 'Kacang Goreng', 'category' => 'Snack', 'sku' => 'SN003', 'price' => 6000, 'track_stock' => true, 'stock' => 25],

            // Rokok
            ['name' => 'Rokok A', 'category' => 'Rokok', 'sku' => 'CG001', 'price' => 25000, 'track_stock' => true, 'stock' => 40],
            ['name' => 'Rokok B', 'category' => 'Rokok', 'sku' => 'CG002', 'price' => 20000, 'track_stock' => true, 'stock' => 35],
        ];

        foreach ($products as $prod) {
            Product::create([
                'tenant_id' => $tenant->id,
                'category_id' => $categories[$prod['category']]->id,
                'name' => $prod['name'],
                'sku' => $prod['sku'],
                'price' => $prod['price'],
                'track_stock' => $prod['track_stock'],
                'stock' => $prod['stock'] ?? 0,
            ]);
        }
    }
}