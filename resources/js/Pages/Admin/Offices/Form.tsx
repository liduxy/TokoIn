import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type L = {
    id: number; name: string; address: string | null;
    latitude: number; longitude: number; radius_meters: number;
    is_active: boolean;
    work_start_time: string; work_end_time: string;
    late_tolerance_minutes: number;
    work_days: number[];
};

type Props = { location: L | null; day_labels: Record<number, string> };

export default function OfficeForm({ location, day_labels }: Props) {
    const editing = !!location;
    const { data, setData, post, put, processing, errors } = useForm({
        name: location?.name ?? '',
        address: location?.address ?? '',
        latitude: location ? String(location.latitude) : '',
        longitude: location ? String(location.longitude) : '',
        radius_meters: location?.radius_meters ?? 100,
        is_active: location?.is_active ?? true,
        work_start_time: location?.work_start_time ?? '08:00',
        work_end_time: location?.work_end_time ?? '17:00',
        late_tolerance_minutes: location?.late_tolerance_minutes ?? 15,
        work_days: location?.work_days ?? [1, 2, 3, 4, 5],
    });

    function toggleDay(iso: number) {
        const set = new Set(data.work_days);
        if (set.has(iso)) set.delete(iso); else set.add(iso);
        setData('work_days', Array.from(set).sort());
    }

    function useMyLocation() {
        if (!navigator.geolocation) return alert('Browser tidak mendukung GPS');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData('latitude', String(pos.coords.latitude));
                setData('longitude', String(pos.coords.longitude));
            },
            (err) => alert('GPS error: ' + err.message),
            { enableHighAccuracy: true, timeout: 15000 },
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing) put(route('admin.offices.update', location!.id));
        else post(route('admin.offices.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{editing ? 'Edit' : 'Tambah'} Lokasi Kantor</h2>}>
            <Head title="Lokasi" />
            <div className="py-6 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white rounded shadow-sm p-4 sm:p-6 space-y-4 text-sm">
                    <Field label="Nama" error={errors.name}>
                        <input className="w-full rounded border-gray-300" required value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </Field>
                    <Field label="Alamat" error={errors.address}>
                        <input className="w-full rounded border-gray-300" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Latitude" error={errors.latitude}>
                            <input className="w-full rounded border-gray-300" required value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                        </Field>
                        <Field label="Longitude" error={errors.longitude}>
                            <input className="w-full rounded border-gray-300" required value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                        </Field>
                    </div>
                    <button type="button" onClick={useMyLocation} className="w-full sm:w-auto px-3 py-2 bg-gray-100 border rounded text-xs">Gunakan Lokasi Saya</button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Radius (m)" error={errors.radius_meters}>
                            <input type="number" min={10} max={10000} className="w-full rounded border-gray-300" required value={data.radius_meters} onChange={(e) => setData('radius_meters', Number(e.target.value))} />
                        </Field>
                        <Field label="Toleransi Telat (menit)" error={errors.late_tolerance_minutes}>
                            <input type="number" min={0} max={240} className="w-full rounded border-gray-300" required value={data.late_tolerance_minutes} onChange={(e) => setData('late_tolerance_minutes', Number(e.target.value))} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Jam Masuk" error={errors.work_start_time}>
                            <input type="time" className="w-full rounded border-gray-300" required value={data.work_start_time} onChange={(e) => setData('work_start_time', e.target.value)} />
                        </Field>
                        <Field label="Jam Pulang" error={errors.work_end_time}>
                            <input type="time" className="w-full rounded border-gray-300" required value={data.work_end_time} onChange={(e) => setData('work_end_time', e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Hari Kerja" error={errors.work_days as string | undefined}>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(day_labels).map(([iso, label]) => {
                                const active = data.work_days.includes(Number(iso));
                                return (
                                    <button type="button" key={iso} onClick={() => toggleDay(Number(iso))}
                                        className={'px-3 py-2 rounded text-xs border ' + (active ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50 text-gray-500 border-gray-200')}>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        Aktif
                    </label>
                    <button type="submit" disabled={processing} className="block w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block mb-1 text-gray-700">{label}</label>
            {children}
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        </div>
    );
}

