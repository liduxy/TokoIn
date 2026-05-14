import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Shift = {
    id: number;
    shift_date: string;
    shift_start: string;
    shift_end: string;
    duration_minutes: number;
    status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
    note: string | null;
    user: { id: number; name: string; employee_id: string | null; role: string } | null;
    office_location: { id: number; name: string } | null;
};

type Employee = { id: number; name: string; employee_id: string | null; role: string };
type Location = { id: number; name: string; work_start_time: string; work_end_time: string; work_days: string };

type Props = {
    shifts: {
        data: Shift[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    employees: Employee[];
    locations: Location[];
    filters: { user_id?: string; office_location_id?: string; date_from?: string; date_to?: string };
    day_labels: Record<number, string>;
};

export default function ShiftsIndex({ shifts, employees, locations, filters, day_labels }: Props) {
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [bulkForm, setBulkForm] = useState({
        office_location_id: '',
        date_from: '',
        date_to: '',
        shift_start: '',
        shift_end: '',
        status: 'assigned',
        note: '',
    });

    function handleFilter() {
        router.get(route('admin.shifts.index'), {
            user_id: filters.user_id || null,
            office_location_id: filters.office_location_id || null,
            date_from: filters.date_from || null,
            date_to: filters.date_to || null,
        }, { preserveState: true });
    }

    function destroy(id: number) {
        if (!confirm('Hapus shift ini?')) return;
        router.delete(route('admin.shifts.destroy', id));
    }

    function toggleUser(userId: number) {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    }

    function submitBulk(e: React.FormEvent) {
        e.preventDefault();
        if (selectedUsers.length === 0) return alert('Pilih minimal 1 karyawan');
        
        router.post(route('admin.shifts.bulk-assign'), {
            user_ids: selectedUsers,
            ...bulkForm,
        });
    }

    const statusColors: Record<string, string> = {
        assigned: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-600',
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Jadwal Shift</h2>}>
            <Head title="Jadwal Shift" />
            
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                    <h3 className="text-lg font-medium">Daftar Shift</h3>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setBulkMode(!bulkMode)}
                            className={`px-3 py-2 rounded text-sm ${bulkMode ? 'bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {bulkMode ? 'Batal' : '+ Assign Massal'}
                        </button>
                        <Link 
                            href={route('admin.shifts.create')} 
                            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            + Tambah Shift
                        </Link>
                    </div>
                </div>

                {/* Bulk Assign Form */}
                {bulkMode && (
                    <form onSubmit={submitBulk} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                        <h4 className="font-medium">Assign Shift Massal</h4>
                        
                        {/* Employee Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Karyawan</label>
                            <div className="flex flex-wrap gap-2">
                                {employees.map(emp => (
                                    <label key={emp.id} className="inline-flex items-center gap-2 px-3 py-1 border rounded cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="checkbox"
                                            checked={selectedUsers.includes(emp.id)}
                                            onChange={() => toggleUser(emp.id)}
                                            className="rounded text-indigo-600"
                                        />
                                        <span className="text-sm">{emp.name} ({emp.role})</span>
                                        {emp.employee_id && <span className="text-xs text-gray-400">({emp.employee_id})</span>}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Shift Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                                <select 
                                    value={bulkForm.office_location_id}
                                    onChange={(e) => setBulkForm({...bulkForm, office_location_id: e.target.value})}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                >
                                    <option value="">Pilih Lokasi</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                <input 
                                    type="date"
                                    value={bulkForm.date_from}
                                    onChange={(e) => setBulkForm({...bulkForm, date_from: e.target.value})}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                                <input 
                                    type="date"
                                    value={bulkForm.date_to}
                                    onChange={(e) => setBulkForm({...bulkForm, date_to: e.target.value})}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                    min={bulkForm.date_from || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                                <input 
                                    type="time"
                                    value={bulkForm.shift_start}
                                    onChange={(e) => setBulkForm({...bulkForm, shift_start: e.target.value})}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                                <input 
                                    type="time"
                                    value={bulkForm.shift_end}
                                    onChange={(e) => setBulkForm({...bulkForm, shift_end: e.target.value})}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={bulkForm.status}
                                    onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="assigned">Ditugaskan</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                Assign Shift
                            </button>
                            <button type="button" onClick={() => setBulkMode(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                Batal
                            </button>
                        </div>
                    </form>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
                            <select 
                                value={filters.user_id || ''}
                                onChange={(e) => router.get(route('admin.shifts.index'), { user_id: e.target.value || null }, { preserveState: true })}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Semua Karyawan</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <select 
                                value={filters.office_location_id || ''}
                                onChange={(e) => router.get(route('admin.shifts.index'), { office_location_id: e.target.value || null }, { preserveState: true })}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Semua Lokasi</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                            <input 
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => router.get(route('admin.shifts.index'), { date_from: e.target.value || null }, { preserveState: true })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                            <input 
                                type="date"
                                value={filters.date_to || ''}
                                onChange={(e) => router.get(route('admin.shifts.index'), { date_to: e.target.value || null }, { preserveState: true })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Shifts Table */}
                <div className="space-y-3 sm:hidden">
                    {shifts.data.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">Belum ada shift.</div>
                    )}
                    {shifts.data.map((shift) => (
                        <div key={shift.id} className="bg-white rounded-lg shadow-sm p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="font-medium text-sm">{shift.shift_date}</div>
                                    <div className="text-xs text-gray-500">{shift.shift_start} - {shift.shift_end} ({shift.duration_minutes} menit)</div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${statusColors[shift.status]}`}>
                                    {shift.status === 'assigned' ? 'Ditugaskan' :
                                     shift.status === 'confirmed' ? 'Dikonfirmasi' :
                                     shift.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                                </span>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">{shift.user?.name} {shift.user?.role ? `(${shift.user.role})` : ''}</div>
                                <div className="text-xs text-gray-500">{shift.user?.employee_id || '-'}</div>
                                <div className="text-xs text-gray-500 mt-1">{shift.office_location?.name || '-'}</div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Link href={route('admin.shifts.edit', shift.id)} className="flex-1 text-center px-3 py-2 rounded bg-indigo-50 text-indigo-700 text-sm">Edit</Link>
                                <button onClick={() => destroy(shift.id)} className="flex-1 px-3 py-2 rounded bg-red-50 text-red-700 text-sm">Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Tanggal</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Waktu</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Karyawan</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Lokasi</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {shifts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada shift.
                                    </td>
                                </tr>
                            ) : (
                                shifts.data.map(shift => (
                                    <tr key={shift.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{shift.shift_date}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{shift.shift_start} - {shift.shift_end}</div>
                                            <div className="text-xs text-gray-500">{shift.duration_minutes} menit</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{shift.user?.name} {shift.user?.role ? `(${shift.user.role})` : ''}</div>
                                            {shift.user?.employee_id && (
                                                <div className="text-xs text-gray-500">{shift.user.employee_id}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{shift.office_location?.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${statusColors[shift.status]}`}>
                                                {shift.status === 'assigned' ? 'Ditugaskan' : 
                                                 shift.status === 'confirmed' ? 'Dikonfirmasi' :
                                                 shift.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Link href={route('admin.shifts.edit', shift.id)} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                            <button onClick={() => destroy(shift.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {shifts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {shifts.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'} disabled:opacity-50`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
