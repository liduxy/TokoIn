<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        
        $query = Product::with('category')
            ->where('tenant_id', $tenantId)
            ->orderBy('name');

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $products = $query->paginate(20)->withQueryString()->through(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock,
                'track_stock' => $product->track_stock,
                'is_active' => $product->is_active,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'color' => $product->category->color,
                ] : null,
            ];
        });

        $categories = Category::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function create(): Response
    {
        $tenantId = request()->user()->tenant_id;
        
        $categories = Category::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateProduct($request);
        $data['tenant_id'] = $request->user()->tenant_id;

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products/' . $data['tenant_id'], 'public');
        }

        Product::create($data);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorizeAccess($request, $product);

        $tenantId = $request->user()->tenant_id;
        
        $categories = Category::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Admin/Products/Form', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'track_stock' => $product->track_stock,
                'stock' => $product->stock,
                'is_active' => $product->is_active,
                'category_id' => $product->category_id,
                'image_path' => $product->image_path,
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeAccess($request, $product);

        $data = $this->validateProduct($request, $product->id);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $request->file('image')->store('products/' . $product->tenant_id, 'public');
        }

        // Delete image if requested
        if ($request->boolean('delete_image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = null;
        }

        $product->update($data);

        return redirect()->route('admin.products.index')->with('success', 'Produk diperbarui.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeAccess($request, $product);

        // Delete image if exists
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Produk dihapus.');
    }

    private function validateProduct(Request $request, ?int $productId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'sku' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('products', 'sku')->where('tenant_id', $request->user()->tenant_id)->ignore($productId),
            ],
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required|integer|min:0',
            'track_stock' => 'boolean',
            'stock' => 'required_if:track_stock,true|integer|min:0',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048', // max 2MB
            'delete_image' => 'boolean',
        ]);
    }

    private function authorizeAccess(Request $request, Product $product): void
    {
        if ($product->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }
    }
}