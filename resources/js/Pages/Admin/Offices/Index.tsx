import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

type L = {
    id: number; name: string; address: string | null;
    latitude: number; longitude: number; radius_meters: number;
    is_active: boolean;
    work_start_time: string; work_end_time: string;
    late_tolerance_minutes: number;
    work_days: number[]; work_day_names: string;
};

export default function OfficesIndex({ locations }: { locations: L[]; day_labels: Record<number, string> }) {
    function destroy(id: number) {
        if (!confirm('Hapus lokasi ini?')) return;
        router.delete(route('admin.offices.destroy', id));
    }
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Lokasi & Jadwal Kerja</h2>}>
            <Head title="Lokasi" />
            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Daftar Lokasi</h3>
                    <Link href={route('admin.offices.create')} className="px-3 py-2 bg-indigo-600 text-white rounded">+ Tambah</Link>
                </div>
                <div className="grid gap-3">
                    {locations.length === 0 && <div className="bg-white rounded p-6 text-center text-gray-500">Belum ada lokasi.</div>}
                    {locations.map((l) => (
                        <div key={l.id} className="bg-white rounded shadow-sm p-4 flex flex-wrap justify-between items-start gap-3">
                            <div className="flex-1 min-w-0 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold text-base">{l.name}</div>
                                    <span className={'px-2 py-0.5 rounded text-xs ' + (l.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600')}>
                                        {l.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="text-gray-500">{l.address}</div>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div><span className="text-gray-500">Masuk:</span> <strong>{l.work_start_time}</strong></div>
                                    <div><span className="text-gray-500">Pulang:</span> <strong>{l.work_end_time}</strong></div>
                                    <div><span className="text-gray-500">Toleransi:</span> <strong>{l.late_tolerance_minutes}m</strong></div>
                                    <div><span className="text-gray-500">Radius:</span> <strong>{l.radius_meters}m</strong></div>
                                </div>
                                <div className="mt-1 text-gray-500">Hari kerja: {l.work_day_names}</div>
                                <div className="mt-1">
                                    <a target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${l.latitude},${l.longitude}`} className="text-indigo-600 text-xs hover:underline">
                                        {l.latitude}, {l.longitude}
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.offices.edit', l.id)} className="px-3 py-1 border rounded text-sm">Edit</Link>
                                <button onClick={() => destroy(l.id)} className="px-3 py-1 border rounded text-sm text-red-600">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
