// resources/js/Pages/Kasir/Index.tsx
import { useState, useEffect, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import axios from 'axios';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    track_stock: boolean;
    stock: number;
    category: string;
    category_color: string | null;
}

interface Category {
    id: number;
    name: string;
    color: string | null;
}

const DEFAULT_CATEGORY_COLOR = '#6366f1';

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
    stock: number;
    track_stock: boolean;
}

export default function KasirIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Modal transaksi
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [paid, setPaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
    const [customerName, setCustomerName] = useState('');
    const [note, setNote] = useState('');

    // Receipt modal
    const [receiptData, setReceiptData] = useState<any>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    // Load categories
    useEffect(() => {
        axios.get('/api/kasir/categories').then(res => setCategories(res.data));
    }, []);

    // Load products
    const loadProducts = useCallback(async () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory) params.set('category_id', selectedCategory.toString());

        const res = await axios.get(`/api/kasir/products?${params}`);
        setProducts(res.data);
    }, [search, selectedCategory]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Add to cart
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                // Validasi stok
                if (product.track_stock && existing.qty >= product.stock) {
                    alert('Stok tidak mencukupi!');
                    return prev;
                }
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                qty: 1,
                subtotal: product.price,
                stock: product.stock,
                track_stock: product.track_stock,
            }];
        });
    };

    // Update qty in cart
    const updateQty = (productId: number, newQty: number) => {
        if (newQty < 1) {
            removeFromCart(productId);
            return;
        }

        setCart(prev => prev.map(item => {
            if (item.product_id !== productId) return item;
            if (item.track_stock && newQty > item.stock) {
                alert('Stok tidak mencukupi!');
                return item;
            }
            return { ...item, qty: newQty, subtotal: newQty * item.price };
        }));
    };

    // Remove from cart
    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal - discount;

    // Process payment
    const processPayment = async () => {
        if (cart.length === 0) return alert('Keranjang kosong!');
        if (paid < total) return alert('Pembayaran kurang!');

        setLoading(true);
        try {
            const res = await axios.post('/api/kasir/transactions', {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    qty: item.qty,
                })),
                discount,
                paid,
                payment_method: paymentMethod,
                customer_name: customerName || undefined,
                note: note || undefined,
            });

            setReceiptData(res.data);
            setShowReceipt(true);
            setShowPaymentModal(false);
            resetForm();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal memproses transaksi');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCart([]);
        setDiscount(0);
        setPaid(0);
        setPaymentMethod('cash');
        setCustomerName('');
        setNote('');
    };

    // Print receipt
    const printReceipt = () => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow || !receiptData) return;

        const receiptHTML = `
            <html>
                <head>
                    <title>Struk - ${receiptData.invoice_no}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 300px; margin: auto; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .line { border-top: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; }
                        td { padding: 2px 0; }
                        .right { text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h3>TOKO KITA</h3>
                        <p>Jl. Contoh No. 123</p>
                        <div class="line"></div>
                        <p>${receiptData.invoice_no}</p>
                        <p>${new Date(receiptData.created_at).toLocaleString('id-ID')}</p>
                        <p>Kasir: ${receiptData.user?.name || '-'}</p>
                        ${receiptData.customer_name ? `<p>Pelanggan: ${receiptData.customer_name}</p>` : ''}
                        <div class="line"></div>
                        <table>
                            ${receiptData.items.map((item: any) => `
                                <tr>
                                    <td>${item.product_name}</td>
                                </tr>
                                <tr>
                                    <td>${item.qty} x Rp ${item.price.toLocaleString('id-ID')}</td>
                                    <td class="right">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                        </table>
                        <div class="line"></div>
                        <table>
                            <tr>
                                <td>Subtotal</td>
                                <td class="right">Rp ${receiptData.subtotal.toLocaleString('id-ID')}</td>
                            </tr>
                            ${receiptData.discount > 0 ? `
                                <tr>
                                    <td>Diskon</td>
                                    <td class="right">-Rp ${receiptData.discount.toLocaleString('id-ID')}</td>
                                </tr>
                            ` : ''}
                            <tr class="bold">
                                <td>Total</td>
                                <td class="right">Rp ${receiptData.total.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr>
                                <td>Bayar (${receiptData.payment_method})</td>
                                <td class="right">Rp ${receiptData.paid.toLocaleString('id-ID')}</td>
                            </tr>
                            <tr class="bold">
                                <td>Kembalian</td>
                                <td class="right">Rp ${receiptData.change_amount.toLocaleString('id-ID')}</td>
                            </tr>
                        </table>
                        ${receiptData.note ? `
                            <div class="line"></div>
                            <p>Catatan: ${receiptData.note}</p>
                        ` : ''}
                        <div class="line"></div>
                        <p class="center">Terima Kasih!</p>
                    </div>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Kasir (POS)</h2>}>
            <Head title="Kasir" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-6 h-[calc(100vh-120px)]">
                    {/* Product Section */}
                    <div className="flex-1 flex flex-col">
                        {/* Search & Filter */}
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                        !selectedCategory ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Semua
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="px-3 py-1 rounded-full text-sm font-medium transition"
                                        style={selectedCategory === cat.id
                                            ? { backgroundColor: cat.color || DEFAULT_CATEGORY_COLOR, color: 'white' }
                                            : { backgroundColor: '#e5e7eb', color: '#374151' }
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {products.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={product.track_stock && product.stock <= 0}
                                        className="text-left p-3 bg-white border rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div
                                            className="w-full h-2 rounded mb-2"
                                            style={{ backgroundColor: product.category_color || DEFAULT_CATEGORY_COLOR }}
                                        />
                                        <p className="font-semibold text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                        <p className="text-indigo-600 font-bold mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
                                        {product.track_stock && (
                                            <p className="text-xs text-gray-400">Stok: {product.stock}</p>
                                        )}
                                        {product.track_stock && product.stock <= 0 && (
                                            <p className="text-xs text-red-500">Habis</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {products.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Tidak ada produk</p>
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="w-96 bg-white rounded-lg shadow flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-lg">Keranjang</h3>
                            <p className="text-sm text-gray-500">{cart.length} item</p>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {cart.map(item => (
                                <div key={item.product_id} className="bg-gray-50 rounded p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-red-500 text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQty(item.product_id, item.qty - 1)}
                                                className="w-7 h-7 bg-gray-200 rounded text-center hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.product_id, item.qty + 1)}
                                                className="w-7 h-7 bg-gray-200 rounded text-center hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="font-semibold text-sm">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <p className="text-center text-gray-400 py-8">Keranjang kosong</p>
                            )}
                        </div>

                        {/* Cart Footer */}
                        <div className="border-t p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setPaid(total);
                                    setShowPaymentModal(true);
                                }}
                                disabled={cart.length === 0}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Bayar · Rp {total.toLocaleString('id-ID')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-auto space-y-4">
                        <h3 className="text-lg font-semibold">Pembayaran</h3>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm w-20">Diskon</label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={e => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="flex-1 border rounded px-3 py-1 text-sm"
                                    min="0"
                                />
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Metode Pembayaran</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex-1 py-2 rounded border text-sm ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                >
                                    💵 Cash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('qris')}
                                    className={`flex-1 py-2 rounded border text-sm ${paymentMethod === 'qris' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                >
                                    📱 QRIS
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">Jumlah Bayar</label>
                            <input
                                type="number"
                                value={paid}
                                onChange={e => setPaid(parseInt(e.target.value) || 0)}
                                className="w-full border rounded px-3 py-2 text-lg font-bold"
                                min="0"
                                autoFocus
                            />
                            {paid >= total && (
                                <p className="text-green-600 text-sm mt-1">
                                    Kembalian: Rp {(paid - total).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm">Nama Pelanggan (opsional)</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="w-full border rounded px-3 py-1 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm">Catatan</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="w-full border rounded px-3 py-1 text-sm"
                                rows={2}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-2 border rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={processPayment}
                                disabled={loading || paid < total}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Memproses...' : 'Selesaikan Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && receiptData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 space-y-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <h3 className="text-lg font-semibold text-green-600">Transaksi Berhasil!</h3>
                            <p className="text-sm text-gray-500">{receiptData.invoice_no}</p>
                            <p className="text-lg font-bold mt-2">Total: Rp {receiptData.total.toLocaleString('id-ID')}</p>
                            <p className="text-sm text-gray-500">Kembalian: Rp {receiptData.change_amount.toLocaleString('id-ID')}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={printReceipt}
                                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                            >
                                🖨️ Cetak Struk
                            </button>
                            <button
                                onClick={() => {
                                    setShowReceipt(false);
                                    setReceiptData(null);
                                }}
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
