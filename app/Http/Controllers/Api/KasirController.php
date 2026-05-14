<?php
// <!-- contrlollers/Api/KasirController.php -->
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KasirController extends Controller
{
    public function categories(Request $request)
    {
        $categories = Category::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    public function products(Request $request)
    {
        $query = Product::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->where('is_active', true);

        // Fitur pencarian
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter kategori
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->with('category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => (int) $product->price,
                    'track_stock' => $product->track_stock,
                    'stock' => (int) $product->stock,
                    'category' => $product->category?->name,
                    'category_color' => $product->category?->color,
                ];
            });

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'discount' => 'nullable|integer|min:0',
            'paid' => 'required|integer|min:0',
            'payment_method' => 'required|in:cash,qris',
            'customer_name' => 'nullable|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        $tenantId = $request->user()->tenant_id;
        $userId = $request->user()->id;

        return DB::transaction(function () use ($request, $tenantId, $userId) {
            $subtotal = 0;
            $items = [];

            // Validasi & hitung subtotal
            foreach ($request->items as $item) {
                $product = Product::where('tenant_id', $tenantId)
                    ->findOrFail($item['product_id']);

                // Validasi stok jika track_stock aktif
                if ($product->track_stock && $product->stock < $item['qty']) {
                    return response()->json([
                        'message' => "Stok {$product->name} tidak mencukupi (tersedia: {$product->stock})",
                    ], 422);
                }

                $itemSubtotal = $product->price * $item['qty'];
                $subtotal += $itemSubtotal;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'price' => $product->price,
                    'qty' => $item['qty'],
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = (int) ($request->discount ?? 0);
            $total = $subtotal - $discount;
            $paid = (int) $request->paid;
            $changeAmount = max(0, $paid - $total);

            // Validasi pembayaran
            if ($paid < $total) {
                return response()->json([
                    'message' => 'Pembayaran kurang dari total',
                ], 422);
            }

            // Generate invoice number
            $invoiceNo = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            // Create transaction
            $transaction = Transaction::create([
                'tenant_id' => $tenantId,
                'user_id' => $userId,
                'invoice_no' => $invoiceNo,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'paid' => $paid,
                'change_amount' => $changeAmount,
                'payment_method' => $request->payment_method,
                'status' => 'paid',
                'customer_name' => $request->customer_name,
                'note' => $request->note,
                'device_id' => null, // Tidak pakai device
            ]);

            // Create transaction items
            foreach ($items as $item) {
                $transaction->items()->create($item);

                // Kurangi stok jika track_stock
                $product = Product::find($item['product_id']);
                if ($product->track_stock) {
                    $product->decrement('stock', $item['qty']);
                }
            }

            // Load relasi
            $transaction->load('items');

            return response()->json($transaction, 201);
        });
    }

    public function transactions(Request $request)
    {
        $transactions = Transaction::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->with('items', 'user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($transactions);
    }

    public function show(Request $request, Transaction $transaction)
    {
        // Validasi tenant
        if ($transaction->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }

        $transaction->load('items', 'user:id,name');

        return response()->json($transaction);
    }
}