import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type U = { id: number; name: string; email: string; role: string; employee_id: string | null; phone: string | null };
type Props = { user: U | null; roles: string[] };

export default function UserForm({ user, roles }: Props) {
    const editing = !!user;
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        role: user?.role ?? roles[0] ?? 'waiters',
        employee_id: user?.employee_id ?? '',
        phone: user?.phone ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing) put(route('admin.users.update', user!.id));
        else post(route('admin.users.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{editing ? 'Edit' : 'Tambah'} Karyawan</h2>}>
            <Head title={editing ? 'Edit User' : 'Tambah User'} />
            <div className="py-6 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white rounded shadow-sm p-4 sm:p-6 space-y-4 text-sm">
                    <Field label="Nama" error={errors.name}>
                        <input className="w-full rounded border-gray-300" required value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" className="w-full rounded border-gray-300" required value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </Field>
                    <Field label={editing ? 'Password (kosongkan jika tidak diubah)' : 'Password'} error={errors.password}>
                        <input type="password" className="w-full rounded border-gray-300" required={!editing} minLength={editing ? undefined : 6} value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    </Field>
                    <Field label="Role" error={errors.role}>
                        <select className="w-full rounded border-gray-300" value={data.role} onChange={(e) => setData('role', e.target.value)}>
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </Field>
                    <Field label="ID Karyawan" error={errors.employee_id}>
                        <input className="w-full rounded border-gray-300" value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} />
                    </Field>
                    <Field label="No HP" error={errors.phone}>
                        <input className="w-full rounded border-gray-300" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    </Field>
                    <button type="submit" disabled={processing} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded">
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

