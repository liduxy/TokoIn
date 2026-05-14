import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type Office = {
    id: number;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    radius_meters: number;
    work_start_time: string;
    work_end_time: string;
    late_tolerance_minutes: number;
    work_days: number[];
    work_day_names: string;
};

type TodayItem = {
    id: number;
    type: 'check_in' | 'check_out';
    time: string;
    distance_meters: number;
    is_late: boolean;
    note: string | null;
    photo_url: string;
};

type TodayShift = {
    id: number;
    start: string;
    end: string;
    location_name: string | null;
    checked_in: boolean;
};

type Props = {
    office: Office | null;
    today_attendances: TodayItem[];
    next_type: 'check_in' | 'check_out';
    has_check_in: boolean;
    has_check_out: boolean;
    is_work_day: boolean;
    will_be_late: boolean;
    can_check_out: boolean;
    today_shifts: TodayShift[];
    next_shift_id: number | null;
    remaining_check_in_count: number;
    now_iso: string;
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function AttendanceIndex(props: Props) {
    const {
        office,
        next_type,
        is_work_day,
        will_be_late,
        can_check_out,
        today_attendances,
        today_shifts,
        next_shift_id,
        remaining_check_in_count,
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [insideRadius, setInsideRadius] = useState<boolean | null>(null);
    const [status, setStatus] = useState<string>('');

    const blockForm =
        !office ||
        !is_work_day ||
        (next_type === 'check_out' && !can_check_out) ||
        (props.has_check_in && props.has_check_out);

    const noteRequired = !!office && is_work_day && next_type === 'check_in' && will_be_late;

    const { data, setData, processing, errors, reset } = useForm({
        type: next_type,
        shift_id: next_shift_id ? String(next_shift_id) : '',
        latitude: '',
        longitude: '',
        photo: '',
        note: '',
    });

    useEffect(() => {
        if (blockForm) return;
        let stream: MediaStream | null = null;
        (async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (e: any) {
                setStatus('Gagal akses kamera: ' + (e?.message || e));
            }
        })();

        return () => {
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, [blockForm]);

    useEffect(() => {
        if (!office || blockForm) return;
        if (!navigator.geolocation) {
            setStatus('Browser tidak mendukung GPS');
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoords({ lat, lng });
                const d = haversine(lat, lng, office.latitude, office.longitude);
                setDistance(d);
                setInsideRadius(d <= office.radius_meters);
            },
            (err) => setStatus('GPS error: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [office?.id, blockForm]);

    function capture() {
        if (photo) {
            setPhoto(null);
            setData('photo', '');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const w = video.videoWidth || 480;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
        setData('photo', dataUrl);
    }

    function doSubmit() {
        if (!photo) {
            setStatus('Ambil foto dulu');
            return;
        }
        if (!coords) {
            setStatus('Tunggu GPS dulu');
            return;
        }
        if (next_type === 'check_in' && !data.shift_id) {
            setStatus('Pilih shift dulu');
            return;
        }

        router.post(
            route('attendance.store'),
            {
                type: next_type,
                shift_id: data.shift_id || null,
                latitude: String(coords.lat),
                longitude: String(coords.lng),
                photo,
                note: data.note,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset('note');
                    setPhoto(null);
                },
            },
        );
    }
    function submit(e: FormEvent) {
        e.preventDefault();
        doSubmit();
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Absen Karyawan</h2>}>
            <Head title="Absen" />
            <div className="py-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pb-24 sm:pb-6">
                {today_attendances.length > 0 && (
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-semibold mb-2">Absen Hari Ini</h3>
                        <ul className="space-y-2 text-sm">
                            {today_attendances.map((a) => (
                                <li key={a.id} className="flex flex-wrap items-center gap-2">
                                    <span className={'px-2 py-0.5 rounded text-xs ' + (a.type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                        {a.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                    </span>
                                    {a.is_late && <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">TELAT</span>}
                                    <span className="text-gray-700">{a.time}</span>
                                    <span className="text-gray-500">({a.distance_meters}m)</span>
                                    {a.note && <span className="text-gray-500 italic">- {a.note}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {today_shifts.length > 0 && (
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-semibold mb-2">Shift Hari Ini</h3>
                        <ul className="space-y-2 text-sm">
                            {today_shifts.map((s) => (
                                <li key={s.id} className="flex flex-wrap items-center gap-2">
                                    <span className="text-gray-700">{s.start} - {s.end}</span>
                                    {s.location_name && <span className="text-gray-500">({s.location_name})</span>}
                                    <span className={'px-2 py-0.5 rounded text-xs ' + (s.checked_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                                        {s.checked_in ? 'sudah check-in' : 'belum check-in'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {office ? (
                    <div className="bg-white p-4 rounded shadow-sm text-sm space-y-2">
                        <div>
                            <div className="font-semibold">{office.name}</div>
                            <div className="text-gray-500">{office.address}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                            <div>Masuk: <strong>{office.work_start_time}</strong></div>
                            <div>Pulang: <strong>{office.work_end_time}</strong></div>
                            <div>Toleransi: <strong>{office.late_tolerance_minutes} mnt</strong></div>
                            <div>Radius: <strong>{office.radius_meters}m</strong></div>
                        </div>
                        <div className="text-gray-500">Hari kerja: {office.work_day_names}</div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded px-4 py-3 text-sm">
                        Tidak ada lokasi shift aktif untuk absen saat ini.
                    </div>
                )}

                {!is_work_day && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded px-4 py-3 text-sm">
                        Anda tidak memiliki jadwal shift hari ini. Absen tidak dapat dilakukan.
                    </div>
                )}

                {office && is_work_day && next_type === 'check_in' && will_be_late && (
                    <div className="bg-orange-50 border border-orange-300 text-orange-800 rounded px-4 py-3 text-sm">
                        Anda <strong>terlambat</strong>. Wajib mengisi <strong>alasan keterlambatan</strong>.
                    </div>
                )}

                {office && next_type === 'check_out' && !can_check_out && (
                    <div className="bg-red-50 border border-red-300 text-red-800 rounded px-4 py-3 text-sm">
                        Belum bisa check-out. Pastikan semua shift sudah check-in dan sudah lewat jam pulang shift terakhir.
                    </div>
                )}

                {!blockForm && (
                    <form onSubmit={submit} className="bg-white p-4 sm:p-6 rounded shadow-sm space-y-4">
                        <h3 className="font-semibold">
                            Foto & Lokasi untuk Absen{' '}
                            <span className={'ml-2 inline-block px-2 py-0.5 rounded text-xs ' + (next_type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                {next_type === 'check_in' ? 'Masuk' : 'Pulang'}
                            </span>
                        </h3>

                        {next_type === 'check_in' && (
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Pilih Shift</label>
                                <select
                                    value={data.shift_id}
                                    onChange={(e) => setData('shift_id', e.target.value)}
                                    className="w-full rounded border-gray-300"
                                >
                                    <option value="">Pilih shift</option>
                                    {today_shifts.map((s) => (
                                        <option key={s.id} value={s.id} disabled={s.checked_in}>
                                            {s.start} - {s.end} {s.location_name ? `(${s.location_name})` : ''} {s.checked_in ? '- sudah check-in' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.shift_id && <div className="text-sm text-red-600 mt-1">{errors.shift_id}</div>}
                                <div className="text-xs text-gray-500 mt-1">Sisa check-in shift: {remaining_check_in_count}</div>
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    className={'w-full rounded bg-black aspect-square object-cover ' + (photo ? 'hidden' : '')}
                                    muted
                                    playsInline
                                />
                                {photo && (
                                    <img
                                        src={photo}
                                        alt="preview"
                                        className="w-full rounded aspect-square object-cover"
                                    />
                                )}

                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            <button
                                type="button"
                                onClick={capture}
                                className="mt-2 w-full px-3 py-2 bg-indigo-600 text-white rounded"
                            >
                                {photo ? 'Ambil Ulang Foto' : 'Ambil Foto'}
                            </button>
                        </div>

                        <div className="text-sm">
                            {coords ? (
                                <div>
                                    Posisi: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
                                    {distance !== null && (
                                        <span className={'ml-2 inline-block px-2 py-0.5 rounded text-xs ' + (insideRadius ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {distance}m {insideRadius ? 'dalam radius' : 'di luar radius'}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500">Mendeteksi GPS...</div>
                            )}
                            {status && <div className="text-red-600">{status}</div>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                {noteRequired ? <>Alasan keterlambatan <span className="text-red-600">*wajib</span></> : 'Catatan (opsional)'}
                            </label>
                            <input
                                type="text"
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                required={noteRequired}
                                maxLength={500}
                                className="w-full rounded border-gray-300"
                                placeholder={noteRequired ? 'Contoh: macet di tol' : 'Contoh: WFO, meeting klien'}
                            />
                            {errors.note && <div className="text-sm text-red-600 mt-1">{errors.note}</div>}
                        </div>

                        <button type="submit" disabled={processing || !photo || !coords} className="hidden sm:inline-flex px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
                            {processing ? 'Mengirim...' : `Submit Absen ${next_type === 'check_in' ? 'Masuk' : 'Pulang'}`}
                        </button>
                    </form>
                )}
            </div>
            {!blockForm && (
                <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white p-3">
                    <button
                        type="button"
                        onClick={doSubmit}
                        disabled={processing || !photo || !coords}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {processing ? 'Mengirim...' : `Submit Absen ${next_type === 'check_in' ? 'Masuk' : 'Pulang'}`}
                    </button>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
