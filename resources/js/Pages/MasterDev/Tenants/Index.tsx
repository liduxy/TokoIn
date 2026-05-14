import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

type T = {
    id: number; name: string; slug: string; phone: string | null; address: string | null;
    is_active: boolean; users_count: number; office_locations_count: number; attendances_count: number;
};
type Props = {
    tenants: T[];
    stats: { total_tenants: number; total_users: number; total_attendances: number };
};

export default function TenantsIndex({ tenants, stats }: Props) {
    function destroy(id: number) {
        if (!confirm('Hapus toko ini? Semua datanya akan ikut terhapus.')) return;
        router.delete(route('master.tenants.destroy', id));
    }
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Master Dev — Kelola Toko</h2>}>
            <Head title="Toko" />
            <div className="py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded shadow-sm p-4"><div className="text-xs text-gray-500">Total Toko</div><div className="text-2xl font-bold">{stats.total_tenants}</div></div>
                    <div className="bg-white rounded shadow-sm p-4"><div className="text-xs text-gray-500">Total User</div><div className="text-2xl font-bold">{stats.total_users}</div></div>
                    <div className="bg-white rounded shadow-sm p-4"><div className="text-xs text-gray-500">Total Absen</div><div className="text-2xl font-bold">{stats.total_attendances}</div></div>
                </div>
                <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Daftar Toko</h3>
                    <Link href={route('master.tenants.create')} className="px-3 py-2 bg-indigo-600 text-white rounded">+ Toko Baru</Link>
                </div>
                <div className="bg-white rounded shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Nama</th>
                                <th className="px-3 py-2 text-left">Slug</th>
                                <th className="px-3 py-2 text-left">User</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Absen</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Belum ada toko.</td></tr>}
                            {tenants.map((t) => (
                                <tr key={t.id} className="border-t">
                                    <td className="px-3 py-2 font-medium">{t.name}<div className="text-xs text-gray-500">{t.address}</div></td>
                                    <td className="px-3 py-2 text-gray-600">{t.slug}</td>
                                    <td className="px-3 py-2">{t.users_count}</td>
                                    <td className="px-3 py-2">{t.office_locations_count}</td>
                                    <td className="px-3 py-2">{t.attendances_count}</td>
                                    <td className="px-3 py-2">
                                        <span className={'px-2 py-0.5 rounded text-xs ' + (t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600')}>
                                            {t.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Link href={route('master.tenants.edit', t.id)} className="text-indigo-600 hover:underline">Edit</Link>
                                        <button onClick={() => destroy(t.id)} className="ml-3 text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
