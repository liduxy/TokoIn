import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Category = {
    id: number;
    name: string;
    color: string;
};

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    track_stock: boolean;
    stock: number;
    is_active: boolean;
    category_id: number | null;
    image_path: string | null;
};

type Props = {
    product: Product | null;
    categories: Category[];
};

export default function ProductForm({ product, categories }: Props) {
    const editing = !!product;
    const [categoryOptions, setCategoryOptions] = useState<Category[]>(categories);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        product?.image_path ? `/storage/${product.image_path}` : null
    );

    const { data, setData, post, put, processing, errors, progress } = useForm({
        name: product?.name || '',
        sku: product?.sku || '',
        // PERBAIKAN 1: Gunakan ?? null agar tipe menjadi number | null
        category_id: product?.category_id ?? null, 
        price: product?.price || 0,
        track_stock: product?.track_stock || false,
        stock: product?.stock || 0,
        is_active: product?.is_active ?? true,
        image: null as File | null,
        delete_image: false,
    });

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function handleDeleteImage() {
        if (editing) {
            setData('delete_image', true);
            setImagePreview(null);
        }
        setData('image', null);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing) {
            put(route('admin.products.update', product.id));
        } else {
            post(route('admin.products.store'));
        }
    }

    async function addCategory() {
        const name = newCategoryName.trim();
        if (!name) {
            setCategoryError('Nama kategori wajib diisi.');
            return;
        }

        setAddingCategory(true);
        setCategoryError(null);

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';

            const response = await fetch(route('admin.categories.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ name, color: newCategoryColor }),
            });

            const payload = await response.json();

            if (!response.ok) {
                const message =
                    payload?.errors?.name?.[0] ||
                    payload?.message ||
                    'Gagal menambahkan kategori.';
                setCategoryError(message);
                return;
            }

            const created = payload.category as Category;
            setCategoryOptions((prev) => {
                if (prev.some((item) => item.id === created.id)) {
                    return prev;
                }
                return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
            });
            setData('category_id', created.id);
            setNewCategoryName('');
            setNewCategoryColor('#6366f1');
        } catch {
            setCategoryError('Gagal terhubung ke server saat menambah kategori.');
        } finally {
            setAddingCategory(false);
        }
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{editing ? 'Edit' : 'Tambah'} Produk</h2>}>
            <Head title={editing ? 'Edit Produk' : 'Tambah Produk'} />
            
            <div className="py-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                        {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                    </div>

                    {/* SKU & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SKU
                            </label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Kode produk (opsional)"
                            />
                            {errors.sku && <div className="text-red-600 text-xs mt-1">{errors.sku}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            {/* PERBAIKAN 2: Gunakan ?? '' untuk value agar valid di HTML select */}
                            <select
                                value={data.category_id ?? ''}
                                onChange={(e) => setData('category_id', e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Tanpa Kategori</option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && <div className="text-red-600 text-xs mt-1">{errors.category_id}</div>}
                            <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Kategori baru"
                                />
                                <input
                                    type="color"
                                    value={newCategoryColor}
                                    onChange={(e) => setNewCategoryColor(e.target.value)}
                                    className="h-10 w-12 rounded border border-gray-300 p-1 bg-white"
                                    title="Warna kategori"
                                />
                                <button
                                    type="button"
                                    onClick={addCategory}
                                    disabled={addingCategory}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                >
                                    {addingCategory ? 'Menambah...' : 'Tambah'}
                                </button>
                            </div>
                            {categoryOptions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {categoryOptions.map((cat) => (
                                        <span key={cat.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-50 border border-gray-200">
                                            <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: cat.color || '#6366f1' }} />
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {categoryError && <div className="text-red-600 text-xs mt-1">{categoryError}</div>}
                        </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Harga <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', Number(e.target.value))}
                                    className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    min="0"
                                    required
                                />
                            </div>
                            {errors.price && <div className="text-red-600 text-xs mt-1">{errors.price}</div>}
                        </div>

                        <div>
                            <label className="inline-flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    checked={data.track_stock}
                                    onChange={(e) => setData('track_stock', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Track Stock</span>
                            </label>
                            
                            {data.track_stock && (
                                <input
                                    type="number"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    min="0"
                                    placeholder="Jumlah stok"
                                />
                            )}
                            {errors.stock && <div className="text-red-600 text-xs mt-1">{errors.stock}</div>}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gambar Produk
                        </label>
                        <div className="space-y-3">
                            {imagePreview && (
                                <div className="relative inline-block">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="h-32 w-32 object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDeleteImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {errors.image && <div className="text-red-600 text-xs mt-1">{errors.image}</div>}
                            {progress && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(progress.percentage || 0)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                
                    {/* Status */}
                    <div>
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Produk Aktif</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <a
                            href={route('admin.products.index')}
                            className="w-full sm:w-auto text-center px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Batal
                        </a>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
