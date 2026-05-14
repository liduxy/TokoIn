import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

type Office = {
    name: string;
    address: string | null;
    work_start_time: string;
    work_end_time: string;
    late_tolerance_minutes: number;
    work_days: number[];
    work_day_names: string;
    radius_meters: number;
};

type Day = {
    date_iso: string;
    date_label: string;
    iso_weekday: number;
    is_work_day: boolean;
    shifts: {
        id: number;
        start: string;
        end: string;
        status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
        location_name: string | null;
        note: string | null;
    }[];
};

type Props = {
    office: Office | null;
    day_labels: Record<number, string>;
    upcoming: Day[];
    today_iso: string;
};

export default function ScheduleIndex({ office, day_labels, upcoming, today_iso }: Props) {
    const statusClasses: Record<string, string> = {
        assigned: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-600',
    };

    const statusLabel: Record<string, string> = {
        assigned: 'Ditugaskan',
        confirmed: 'Dikonfirmasi',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Jadwal Kerja</h2>}>
            <Head title="Jadwal" />
            <div className="py-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {!office ? (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded px-4 py-3">
                        Lokasi & jadwal kerja belum dikonfigurasi.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded shadow-sm p-4 space-y-3">
                            <div>
                                <div className="font-semibold text-lg">{office.name}</div>
                                <div className="text-gray-500">{office.address}</div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div className="bg-gray-50 rounded p-3"><div className="text-gray-500">Jam Masuk</div><div className="font-semibold text-base">{office.work_start_time}</div></div>
                                <div className="bg-gray-50 rounded p-3"><div className="text-gray-500">Jam Pulang</div><div className="font-semibold text-base">{office.work_end_time}</div></div>
                                <div className="bg-gray-50 rounded p-3"><div className="text-gray-500">Toleransi Telat</div><div className="font-semibold text-base">{office.late_tolerance_minutes} mnt</div></div>
                                <div className="bg-gray-50 rounded p-3"><div className="text-gray-500">Radius Absen</div><div className="font-semibold text-base">{office.radius_meters}m</div></div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Hari Kerja</div>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(day_labels).map(([iso, label]) => {
                                        const active = office.work_days.includes(Number(iso));
                                        return (
                                            <span key={iso} className={'px-2 py-1 rounded text-xs ' + (active ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-500')}>
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded shadow-sm p-4">
                            <h3 className="font-semibold mb-3">Shift 7 Hari ke Depan</h3>
                            <ul className="space-y-2 text-sm">
                                {upcoming.map((d) => (
                                    <li key={d.date_iso} className="border rounded p-3">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                <strong>{day_labels[d.iso_weekday]}</strong>, {d.date_label}
                                                {d.date_iso === today_iso && <span className="ml-2 text-xs text-indigo-600">(hari ini)</span>}
                                            </span>
                                            <span className={'px-2 py-0.5 rounded text-xs ' + (d.is_work_day ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500')}>
                                                {d.is_work_day ? `${d.shifts.length} shift` : 'Libur'}
                                            </span>
                                        </div>
                                        {d.shifts.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {d.shifts.map((s) => (
                                                    <div key={s.id} className="bg-gray-50 rounded p-2 flex flex-wrap items-center gap-2">
                                                        <span className="font-medium">{s.start} - {s.end}</span>
                                                        {s.location_name && <span className="text-gray-500">({s.location_name})</span>}
                                                        <span className={'px-2 py-0.5 rounded text-xs ' + (statusClasses[s.status] || 'bg-gray-100 text-gray-600')}>
                                                            {statusLabel[s.status] || s.status}
                                                        </span>
                                                        {s.note && <span className="text-xs text-gray-500">- {s.note}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded p-4 text-sm space-y-1">
                            <div><strong>Aturan absen:</strong></div>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>Absen hanya bisa dilakukan jika Anda punya <strong>shift terjadwal</strong> di hari tersebut.</li>
                                <li>Jika ada beberapa shift dalam sehari, Anda wajib <strong>check-in per shift</strong>.</li>
                                <li>Check-out hanya bisa dilakukan setelah jam pulang <strong>shift terakhir</strong>.</li>
                                <li>Posisi GPS harus dalam radius <strong>{office.radius_meters}m</strong> dari titik kantor.</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
