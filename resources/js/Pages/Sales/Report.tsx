import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Cashier = { id: number; name: string; role: string };
type Summary = {
    trx_count: number;
    omzet: number;
    discount_total: number;
    avg_ticket: number;
    items_sold: number;
    cash_total: number;
    qris_total: number;
};
type TopProduct = { name: string; qty: number; omzet: number };
type TransactionItem = {
    id: number;
    invoice_no: string;
    date: string;
    time: string;
    cashier: { id: number; name: string; role: string } | null;
    payment_method: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    change_amount: number;
};

type Props = {
    filters: { cashier_id: number | null; date_from: string | null; date_to: string | null; payment_method: string | null };
    cashiers: Cashier[];
    summary: Summary;
    top_products: TopProduct[];
    transactions: { data: TransactionItem[]; links: any[]; current_page: number; last_page: number };
};

function rupiah(v: number) {
    return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function SalesReport({ filters, cashiers, summary, top_products, transactions }: Props) {
    const [f, setF] = useState({
        cashier_id: filters.cashier_id ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        payment_method: filters.payment_method ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        router.get(route('sales.report'), f, { preserveState: true, preserveScroll: true });
    }

    function resetFilter() {
        setF({ cashier_id: '', date_from: '', date_to: '', payment_method: '' });
        router.get(route('sales.report'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Rekap Penjualan</h2>}>
            <Head title="Rekap Penjualan" />
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <form onSubmit={submit} className="bg-white rounded shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                    <select className="rounded border-gray-300" value={f.cashier_id} onChange={(e) => setF({ ...f, cashier_id: e.target.value })}>
                        <option value="">Semua kasir</option>
                        {cashiers.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                        ))}
                    </select>
                    <select className="rounded border-gray-300" value={f.payment_method} onChange={(e) => setF({ ...f, payment_method: e.target.value })}>
                        <option value="">Semua metode</option>
                        <option value="cash">Cash</option>
                        <option value="qris">QRIS</option>
                    </select>
                    <input type="date" className="rounded border-gray-300" value={f.date_from} onChange={(e) => setF({ ...f, date_from: e.target.value })} />
                    <input type="date" className="rounded border-gray-300" value={f.date_to} onChange={(e) => setF({ ...f, date_to: e.target.value })} />
                    <div className="flex gap-2">
                        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Filter</button>
                        <button type="button" onClick={resetFilter} className="px-3 py-2 bg-gray-200 rounded">Reset</button>
                    </div>
                </form>

                <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                    <Stat label="Transaksi" value={summary.trx_count.toString()} />
                    <Stat label="Omzet" value={rupiah(summary.omzet)} />
                    <Stat label="Diskon" value={rupiah(summary.discount_total)} />
                    <Stat label="Avg Ticket" value={rupiah(summary.avg_ticket)} />
                    <Stat label="Item Terjual" value={summary.items_sold.toString()} />
                    <Stat label="Cash" value={rupiah(summary.cash_total)} />
                    <Stat label="QRIS" value={rupiah(summary.qris_total)} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="bg-white rounded shadow-sm p-4 xl:col-span-2 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left">Invoice</th>
                                    <th className="px-3 py-2 text-left">Waktu</th>
                                    <th className="px-3 py-2 text-left">Kasir</th>
                                    <th className="px-3 py-2 text-left">Metode</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.length === 0 && (
                                    <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Tidak ada data transaksi.</td></tr>
                                )}
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="border-t">
                                        <td className="px-3 py-2 font-medium">{t.invoice_no}</td>
                                        <td className="px-3 py-2">{t.date} <span className="text-gray-500">{t.time}</span></td>
                                        <td className="px-3 py-2">{t.cashier?.name ?? '-'} <span className="text-xs text-gray-500">({t.cashier?.role ?? '-'})</span></td>
                                        <td className="px-3 py-2 uppercase text-xs">{t.payment_method}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{rupiah(t.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded shadow-sm p-4">
                        <h3 className="font-semibold mb-3">Top Produk</h3>
                        <div className="space-y-2 text-sm">
                            {top_products.length === 0 && <div className="text-gray-500">Belum ada data.</div>}
                            {top_products.map((p, i) => (
                                <div key={p.name} className="border-b last:border-0 pb-2">
                                    <div className="font-medium">{i + 1}. {p.name}</div>
                                    <div className="text-xs text-gray-500">{p.qty} item</div>
                                    <div className="text-sm font-semibold">{rupiah(p.omzet)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {transactions.links.map((l: any, i: number) => (
                            l.url ? (
                                <Link key={i} href={l.url} preserveScroll preserveState
                                    className={'px-3 py-1 rounded border text-sm ' + (l.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300')}
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

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded shadow-sm p-4">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-lg font-bold">{value}</div>
        </div>
    );
}

