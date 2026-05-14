import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

type U = { id: number; name: string; email: string; role: string; employee_id: string | null; phone: string | null };
type Props = { users: U[]; roles: string[] };

export default function UsersIndex({ users }: Props) {
    function destroy(id: number) {
        if (!confirm('Hapus user ini?')) return;
        router.delete(route('admin.users.destroy', id));
    }
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Karyawan</h2>}>
            <Head title="Karyawan" />
            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Daftar Karyawan</h3>
                    <Link href={route('admin.users.create')} className="px-3 py-2 bg-indigo-600 text-white rounded">+ Tambah</Link>
                </div>
                <div className="bg-white rounded shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Nama</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">Role</th>
                                <th className="px-3 py-2 text-left">ID Karyawan</th>
                                <th className="px-3 py-2 text-left">HP</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Belum ada user.</td></tr>}
                            {users.map((u) => (
                                <tr key={u.id} className="border-t">
                                    <td className="px-3 py-2">{u.name}</td>
                                    <td className="px-3 py-2">{u.email}</td>
                                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">{u.role}</span></td>
                                    <td className="px-3 py-2">{u.employee_id || '—'}</td>
                                    <td className="px-3 py-2">{u.phone || '—'}</td>
                                    <td className="px-3 py-2 text-right">
                                        <Link href={route('admin.users.edit', u.id)} className="text-indigo-600 hover:underline">Edit</Link>
                                        <button onClick={() => destroy(u.id)} className="ml-3 text-red-600 hover:underline">Hapus</button>
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
