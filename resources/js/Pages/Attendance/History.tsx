import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type Item = {
    id: number;
    date: string;
    time: string;
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
    attendances: {
        data: Item[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
};

export default function History({ attendances }: Props) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Riwayat Absen Saya</h2>}>
            <Head title="Riwayat" />
            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="space-y-3 sm:hidden">
                    {attendances.data.length === 0 && (
                        <div className="bg-white rounded shadow-sm p-4 text-center text-gray-500">Belum ada absen.</div>
                    )}
                    {attendances.data.map((a) => (
                        <div key={a.id} className="bg-white rounded shadow-sm p-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{a.date}</div>
                                <div className="text-gray-500">{a.time}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={'px-2 py-0.5 rounded text-xs ' + (a.type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                    {a.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                </span>
                                {a.is_late && <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">TELAT</span>}
                                <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs">
                                    {a.distance_meters}m
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <a href={a.photo_url} target="_blank" rel="noreferrer">
                                    <img src={a.photo_url} alt="" className="h-14 w-14 object-cover rounded" />
                                </a>
                                <div className="text-xs text-gray-500">
                                    <div>{a.office_name || '-'}</div>
                                    <div>{a.note || '-'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden sm:block bg-white rounded shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-3 py-2 text-left">Tanggal</th>
                                <th className="px-3 py-2 text-left">Jam</th>
                                <th className="px-3 py-2 text-left">Tipe</th>
                                <th className="px-3 py-2 text-left">Foto</th>
                                <th className="px-3 py-2 text-left">Lokasi</th>
                                <th className="px-3 py-2 text-left">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.data.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Belum ada absen.</td></tr>
                            )}
                            {attendances.data.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2">{a.date}</td>
                                    <td className="px-3 py-2">{a.time}</td>
                                    <td className="px-3 py-2">
                                        <span className={'px-2 py-0.5 rounded text-xs ' + (a.type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                            {a.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                        </span>
                                        {a.is_late && <span className="ml-1 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">TELAT</span>}
                                    </td>
                                    <td className="px-3 py-2">
                                        <a href={a.photo_url} target="_blank" rel="noreferrer">
                                            <img src={a.photo_url} alt="" className="h-12 w-12 object-cover rounded" />
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
                        {attendances.links.map((l, i) => (
                            l.url ? (
                                <Link key={i} href={l.url} preserveScroll
                                    className={'px-3 py-1 rounded border text-sm ' + (l.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 hover:bg-gray-50')}
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

