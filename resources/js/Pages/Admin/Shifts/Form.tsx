import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type ShiftForm = {
    id: number;
    user_id: number;
    office_location_id: number;
    shift_date: string;
    shift_start: string;
    shift_end: string;
    status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
    note: string | null;
};

type Employee = { id: number; name: string; employee_id: string | null; role: string };
type Location = { id: number; name: string };

type Props = {
    shift: ShiftForm | null;
    employees: Employee[];
    locations: Location[];
};

export default function ShiftFormPage({ shift, employees, locations }: Props) {
    const editing = !!shift;

    const { data, setData, post, put, processing, errors } = useForm({
        user_id: shift?.user_id ? String(shift.user_id) : '',
        office_location_id: shift?.office_location_id ? String(shift.office_location_id) : '',
        shift_date: shift?.shift_date || '',
        shift_start: shift?.shift_start || '',
        shift_end: shift?.shift_end || '',
        status: shift?.status || 'assigned',
        note: shift?.note || '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing && shift) {
            put(route('admin.shifts.update', shift.id));
            return;
        }
        post(route('admin.shifts.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{editing ? 'Edit Shift' : 'Tambah Shift'}</h2>}>
            <Head title={editing ? 'Edit Shift' : 'Tambah Shift'} />

            <div className="py-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                required
                            >
                                <option value="">Pilih karyawan</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.role}) {emp.employee_id ? `- ${emp.employee_id}` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <div className="text-red-600 text-xs mt-1">{errors.user_id}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <select
                                value={data.office_location_id}
                                onChange={(e) => setData('office_location_id', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                required
                            >
                                <option value="">Pilih lokasi</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            {errors.office_location_id && <div className="text-red-600 text-xs mt-1">{errors.office_location_id}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input
                                type="date"
                                value={data.shift_date}
                                onChange={(e) => setData('shift_date', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                required
                            />
                            {errors.shift_date && <div className="text-red-600 text-xs mt-1">{errors.shift_date}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                            <input
                                type="time"
                                value={data.shift_start}
                                onChange={(e) => setData('shift_start', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                required
                            />
                            {errors.shift_start && <div className="text-red-600 text-xs mt-1">{errors.shift_start}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                            <input
                                type="time"
                                value={data.shift_end}
                                onChange={(e) => setData('shift_end', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                required
                            />
                            {errors.shift_end && <div className="text-red-600 text-xs mt-1">{errors.shift_end}</div>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as ShiftForm['status'])}
                            className="w-full rounded-lg border-gray-300"
                        >
                            <option value="assigned">Ditugaskan</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                        {errors.status && <div className="text-red-600 text-xs mt-1">{errors.status}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                        <textarea
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                            rows={3}
                        />
                        {errors.note && <div className="text-red-600 text-xs mt-1">{errors.note}</div>}
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan Shift'}
                        </button>
                        <Link href={route('admin.shifts.index')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
