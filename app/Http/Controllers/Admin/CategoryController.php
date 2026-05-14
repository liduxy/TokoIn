<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where('tenant_id', $tenantId),
            ],
            'color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6})$/'],
        ]);

        $category = Category::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'color' => $data['color'] ?? '#6366f1',
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
            ],
        ]);
    }
}
