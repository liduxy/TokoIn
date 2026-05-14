import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Welcome() {
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;

    return (
        <>
            <Head title="TokoIn" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
                <div className="max-w-2xl text-center space-y-6">
                    <h1 className="text-5xl font-bold text-indigo-700">TokoIn</h1>
                    <p className="text-lg text-gray-600">
                        Sistem absensi karyawan + kasir (POS) untuk semua jenis toko —
                        bakso, kelontong, retail, dll. Multi-toko, multi-role.
                    </p>
                    <div className="flex justify-center gap-3">
                        {user ? (
                            <Link href={route('dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded">
                                Buka Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="px-6 py-2 bg-indigo-600 text-white rounded">
                                    Login
                                </Link>
                                <Link href={route('register')} className="px-6 py-2 bg-white border border-gray-300 rounded">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
