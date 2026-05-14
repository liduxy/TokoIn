import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type Stats = {
    sales_today_omzet: number;
    sales_today_trx: number;
    sales_month_omzet: number;
    sales_month_trx: number;
    sales_month_discount: number;
    attendance_today_count: number;
    attendance_today_late: number;
    employees_total: number;
    employees_present_today: number;
    shifts_today_count: number;
};

type DailySales = { day: string; trx_count: number; omzet: number };
type TopProduct = { name: string; qty: number; omzet: number };
type RecentTransaction = {
    id: number;
    invoice_no: string;
    datetime: string;
    cashier_name: string;
    cashier_role: string;
    payment_method: string;
    total: number;
};
type RecentAttendance = {
    id: number;
    datetime: string;
    user_name: string;
    user_role: string;
    type: 'check_in' | 'check_out';
    is_late: boolean;
};

type Props = {
    stats: Stats;
    daily_sales: DailySales[];
    top_products: TopProduct[];
    recent_transactions: RecentTransaction[];
    recent_attendance: RecentAttendance[];
};

function rupiah(v: number) {
    return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function AdminDashboard({ stats, daily_sales, top_products, recent_transactions, recent_attendance }: Props) {
    const maxDailyOmzet = Math.max(1, ...daily_sales.map((d) => d.omzet));

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Dashboard Operasional</h2>}>
            <Head title="Dashboard" />
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Link href={route('sales.report')} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Buka Rekap Penjualan</Link>
                    <Link href={route('admin.attendance.report')} className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm">Buka Rekap Karyawan</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Stat label="Omzet Hari Ini" value={rupiah(stats.sales_today_omzet)} />
                    <Stat label="Transaksi Hari Ini" value={stats.sales_today_trx.toString()} />
                    <Stat label="Omzet Bulan Ini" value={rupiah(stats.sales_month_omzet)} />
                    <Stat label="Transaksi Bulan Ini" value={stats.sales_month_trx.toString()} />
                    <Stat label="Diskon Bulan Ini" value={rupiah(stats.sales_month_discount)} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Stat label="Total Karyawan Aktif" value={stats.employees_total.toString()} />
                    <Stat label="Hadir Hari Ini" value={stats.employees_present_today.toString()} />
                    <Stat label="Absensi Hari Ini" value={stats.attendance_today_count.toString()} />
                    <Stat label="Telat Hari Ini" value={stats.attendance_today_late.toString()} />
                    <Stat label="Total Shift Hari Ini" value={stats.shifts_today_count.toString()} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="bg-white rounded shadow-sm p-4 xl:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Tren Omzet 14 Hari</h3>
                            <Link href={route('sales.report')} className="text-sm text-indigo-600 hover:underline">Lihat Rekap Lengkap</Link>
                        </div>
                        <div className="space-y-2">
                            {daily_sales.length === 0 && <div className="text-sm text-gray-500">Belum ada transaksi.</div>}
                            {daily_sales.map((d) => (
                                <div key={d.day} className="grid grid-cols-[70px_1fr_110px] gap-2 items-center text-sm">
                                    <span className="text-gray-600">{d.day}</span>
                                    <div className="h-2 rounded bg-gray-100 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${Math.max(2, Math.round((d.omzet / maxDailyOmzet) * 100))}%` }} />
                                    </div>
                                    <span className="text-right font-medium">{rupiah(d.omzet)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm p-4">
                        <h3 className="font-semibold mb-3">Produk Terlaris (Bulan Ini)</h3>
                        <div className="space-y-2 text-sm">
                            {top_products.length === 0 && <div className="text-gray-500">Belum ada data.</div>}
                            {top_products.map((p, i) => (
                                <div key={p.name} className="flex items-start justify-between gap-2 border-b last:border-0 pb-2">
                                    <div>
                                        <div className="font-medium">{i + 1}. {p.name}</div>
                                        <div className="text-xs text-gray-500">{p.qty} item</div>
                                    </div>
                                    <div className="text-right font-medium">{rupiah(p.omzet)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-white rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Transaksi Terbaru</h3>
                            <Link href={route('sales.report')} className="text-sm text-indigo-600 hover:underline">Semua</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Invoice</th>
                                        <th className="px-3 py-2 text-left">Kasir</th>
                                        <th className="px-3 py-2 text-left">Metode</th>
                                        <th className="px-3 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_transactions.length === 0 && (
                                        <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Belum ada transaksi.</td></tr>
                                    )}
                                    {recent_transactions.map((t) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="px-3 py-2">
                                                <div className="font-medium">{t.invoice_no}</div>
                                                <div className="text-xs text-gray-500">{t.datetime}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div>{t.cashier_name}</div>
                                                <div className="text-xs text-gray-500">{t.cashier_role}</div>
                                            </td>
                                            <td className="px-3 py-2 uppercase text-xs">{t.payment_method}</td>
                                            <td className="px-3 py-2 text-right font-medium">{rupiah(t.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b">
                            <h3 className="font-semibold">Absensi Terbaru</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Waktu</th>
                                        <th className="px-3 py-2 text-left">Karyawan</th>
                                        <th className="px-3 py-2 text-left">Tipe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_attendance.length === 0 && (
                                        <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">Belum ada data absensi.</td></tr>
                                    )}
                                    {recent_attendance.map((a) => (
                                        <tr key={a.id} className="border-t">
                                            <td className="px-3 py-2">{a.datetime}</td>
                                            <td className="px-3 py-2">
                                                <div>{a.user_name}</div>
                                                <div className="text-xs text-gray-500">{a.user_role}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={'px-2 py-0.5 rounded text-xs ' + (a.type === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                                    {a.type === 'check_in' ? 'Masuk' : 'Pulang'}
                                                </span>
                                                {a.is_late && <span className="ml-1 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">TELAT</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded shadow-sm p-4">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-xl sm:text-2xl font-bold">{value}</div>
        </div>
    );
}
