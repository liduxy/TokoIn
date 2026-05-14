import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    stock: number;
    track_stock: boolean;
    is_active: boolean;
    category: {
        id: number;
        name: string;
        color: string;
    } | null;
};

type Category = {
    id: number;
    name: string;
};

type Filters = {
    search: string | null;
    category_id: string | null;
    status: string | null;
};

type Props = {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: Filters;
};

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || '');

    function handleFilter() {
        router.get(route('admin.products.index'), {
            search: search || null,
            category_id: categoryId || null,
            status: status || null,
        }, {
            preserveState: true,
        });
    }

    function resetFilters() {
        setSearch('');
        setCategoryId('');
        setStatus('');
        router.get(route('admin.products.index'), {}, {
            preserveState: true,
        });
    }

    function destroy(id: number) {
        if (!confirm('Hapus produk ini?')) return;
        router.delete(route('admin.products.destroy', id));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Produk</h2>}>
            <Head title="Produk" />
            
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Daftar Produk</h3>
                    <Link 
                        href={route('admin.products.create')} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        + Tambah Produk
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cari Produk
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Nama atau SKU..."
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Filter
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Produk</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Kategori</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">SKU</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-700">Harga</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-700">Stok</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Belum ada produk.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.category ? (
                                                    <span 
                                                        className="px-2 py-1 rounded text-xs text-white"
                                                        style={{ backgroundColor: product.category.color }}
                                                    >
                                                        {product.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {product.track_stock ? (
                                                    <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                                                        {product.stock}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">∞</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    product.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Link
                                                    href={route('admin.products.edit', product.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => destroy(product.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {products.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1 rounded ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                } disabled:opacity-50`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}