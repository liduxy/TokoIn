import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type T = { id: number; name: string; slug: string; phone: string | null; address: string | null; is_active: boolean };
type Props = { tenant: T | null };

export default function TenantForm({ tenant }: Props) {
    const editing = !!tenant;
    const { data, setData, post, put, processing, errors } = useForm({
        name: tenant?.name ?? '',
        slug: tenant?.slug ?? '',
        phone: tenant?.phone ?? '',
        address: tenant?.address ?? '',
        is_active: tenant?.is_active ?? true,
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editing) put(route('master.tenants.update', tenant!.id));
        else post(route('master.tenants.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{editing ? 'Edit' : 'Tambah'} Toko</h2>}>
            <Head title="Toko" />
            <div className="py-6 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white rounded shadow-sm p-6 space-y-4 text-sm">
                    <Field label="Nama Toko" error={errors.name}>
                        <input className="w-full rounded border-gray-300" required value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </Field>
                    <Field label="Slug (kosongkan untuk auto)" error={errors.slug}>
                        <input className="w-full rounded border-gray-300" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                    </Field>
                    <Field label="HP" error={errors.phone}>
                        <input className="w-full rounded border-gray-300" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    </Field>
                    <Field label="Alamat" error={errors.address}>
                        <input className="w-full rounded border-gray-300" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </Field>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        Aktif
                    </label>

                    {!editing && (
                        <fieldset className="border rounded p-3 space-y-3">
                            <legend className="px-2 text-xs text-gray-600">Buat Owner Awal (opsional)</legend>
                            <Field label="Nama Owner" error={errors.owner_name}>
                                <input className="w-full rounded border-gray-300" value={data.owner_name} onChange={(e) => setData('owner_name', e.target.value)} />
                            </Field>
                            <Field label="Email Owner" error={errors.owner_email}>
                                <input type="email" className="w-full rounded border-gray-300" value={data.owner_email} onChange={(e) => setData('owner_email', e.target.value)} />
                            </Field>
                            <Field label="Password Owner" error={errors.owner_password}>
                                <input type="password" className="w-full rounded border-gray-300" value={data.owner_password} onChange={(e) => setData('owner_password', e.target.value)} />
                            </Field>
                        </fieldset>
                    )}

                    <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded">
                        {processing ? 'Menyimpan…' : 'Simpan'}
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
