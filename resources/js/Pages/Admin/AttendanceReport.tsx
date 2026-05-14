import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Item = {
    id: number;
    date: string;
    time: string;
    user: { id: number | null; name: string; employee_id: string | null; role: string };
    type: 'check_in' | 'check_out';
    is_late: boolean;
    note: string | null;
    distance_meters: number;
    latitude: number;
    longitude: number;
    photo_url: string;
    office_name: string | null;
};

type Props = {
    attendances: { data: Item[]; links: any[]; current_page: number; last_page: number };
    users: Array<{ id: number; name: string; role: string }>;
    filters: { user_id: number | null; type: string | null; date_from: string | null; date_to: string | null };
    stats: { today: number; this_month: number; late_this_month: number; total_users: number };
};

export default function AttendanceReport({ attendances, users, filters, stats }: Props) {
    const [f, setF] = useState({
        user_id: filters.user_id ?? '',
        type: filters.type ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        router.get(route('admin.attendance.report'), f, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Rekap Karyawan</h2>}>
            <Head title="Rekap Karyawan" />
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Absen Hari Ini" value={stats.today} />
                    <Stat label="Absen Bulan Ini" value={stats.this_month} />
                    <Stat label="Telat Bulan Ini" value={stats.late_this_month} />
                    <Stat label="Total Karyawan" value={stats.total_users} />
                </div>

                <form onSubmit={submit} className="bg-white rounded shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                    <select className="rounded border-gray-300" value={f.user_id} onChange={(e) => setF({ ...f, user_id: e.target.value })}>
                        <option value="">Semua karyawan</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                    <select className="rounded border-gray-300" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                        <option value="">Semua tipe</option>
                        <option value="check_in">Masuk</option>
                        <option value="check_out">Pulang</option>
                    </select>
                    <input type="date" className="rounded border-gray-300" value={f.date_from} onChange={(e) => setF({ ...f, date_from: e.target.value })} />
                    <input type="date" className="rounded border-gray-300" value={f.date_to} onChange={(e) => setF({ ...f, date_to: e.target.value })} />
                    <div className="flex gap-2">
                        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Filter</button>
                        <Link href={route('admin.dashboard')} className="px-3 py-2 bg-gray-200 rounded">Dashboard</Link>
                    </div>
                </form>

                <div className="bg-white rounded shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-3 py-2 text-left">Tanggal/Jam</th>
                                <th className="px-3 py-2 text-left">Karyawan</th>
                                <th className="px-3 py-2 text-left">Tipe</th>
                                <th className="px-3 py-2 text-left">Foto</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.data.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Tidak ada data.</td></tr>
                            )}
                            {attendances.data.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2 whitespace-nowrap">{a.date} <span className="text-gray-500">{a.time}</span></td>
                                    <td className="px-3 py-2">
                                        <div className="font-medium">{a.user.name}</div>
                                        <div className="text-xs text-gray-500">{a.user.role}{a.user.employee_id ? ` - ${a.user.employee_id}` : ''}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={'px-2 py-0.5 rounded text-xs ' + (a.type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                            {a.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                        </span>
                                        {a.is_late && <span className="ml-1 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">TELAT</span>}
                                    </td>
                                    <td className="px-3 py-2">
                                        <a href={a.photo_url} target="_blank" rel="noreferrer">
                                            <img src={a.photo_url} alt="" className="h-10 w-10 object-cover rounded" />
                                        </a>
                                    </td>
                                    <td className="px-3 py-2">
                                        <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                                            {a.distance_meters}m
                                        </a>
                                        <div className="text-xs text-gray-500">{a.office_name}</div>
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">{a.note || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {attendances.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {attendances.links.map((l: any, i: number) => (
                            l.url ? (
                                <Link key={i} href={l.url} preserveScroll preserveState
                                    className={'px-3 py-1 rounded border text-sm ' + (l.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300')}
                                    dangerouslySetInnerHTML={{ __html: l.label }} />
                            ) : (
                                <span key={i} className="px-3 py-1 rounded border text-sm bg-gray-100 text-gray-400 border-gray-200" dangerouslySetInnerHTML={{ __html: l.label }} />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded shadow-sm p-4">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

