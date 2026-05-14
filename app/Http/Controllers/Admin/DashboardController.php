<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();

        $salesMonth = Transaction::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $monthStart->toDateString())
            ->whereDate('created_at', '<=', $today->toDateString());

        $salesMonthSummary = (clone $salesMonth)
            ->selectRaw('COUNT(*) as trx_count, COALESCE(SUM(total),0) as omzet, COALESCE(SUM(discount),0) as discount_total')
            ->first();

        $salesToday = Transaction::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereDate('created_at', $today->toDateString());

        $salesTodaySummary = (clone $salesToday)
            ->selectRaw('COUNT(*) as trx_count, COALESCE(SUM(total),0) as omzet')
            ->first();

        $attendanceToday = Attendance::query()
            ->where('tenant_id', $tenantId)
            ->whereDate('created_at', $today->toDateString());

        $attendanceTodayCount = (clone $attendanceToday)->count();
        $lateTodayCount = (clone $attendanceToday)->where('is_late', true)->count();

        $activeEmployeeCount = User::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('role', [User::ROLE_WAITERS, User::ROLE_KASIR, User::ROLE_ADMIN])
            ->count();

        $presentUsersToday = Attendance::query()
            ->where('tenant_id', $tenantId)
            ->where('type', Attendance::TYPE_CHECK_IN)
            ->whereDate('created_at', $today->toDateString())
            ->distinct('user_id')
            ->count('user_id');

        $shiftTodayCount = Shift::query()
            ->where('tenant_id', $tenantId)
            ->whereDate('shift_date', $today->toDateString())
            ->whereIn('status', [Shift::STATUS_ASSIGNED, Shift::STATUS_CONFIRMED, Shift::STATUS_COMPLETED])
            ->count();

        $dailySales = Transaction::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $today->copy()->subDays(13)->toDateString())
            ->whereDate('created_at', '<=', $today->toDateString())
            ->selectRaw('DATE(created_at) as day, COUNT(*) as trx_count, COALESCE(SUM(total),0) as omzet')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($r) => [
                'day' => Carbon::parse($r->day)->format('d M'),
                'trx_count' => (int) $r->trx_count,
                'omzet' => (int) $r->omzet,
            ])
            ->values();

        $topProducts = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.status', 'paid')
            ->whereDate('transactions.created_at', '>=', $monthStart->toDateString())
            ->whereDate('transactions.created_at', '<=', $today->toDateString())
            ->groupBy('transaction_items.product_name')
            ->orderByDesc(DB::raw('SUM(transaction_items.qty)'))
            ->limit(6)
            ->get([
                DB::raw('transaction_items.product_name as name'),
                DB::raw('SUM(transaction_items.qty) as qty'),
                DB::raw('SUM(transaction_items.subtotal) as omzet'),
            ])
            ->map(fn ($r) => [
                'name' => $r->name,
                'qty' => (int) $r->qty,
                'omzet' => (int) $r->omzet,
            ])
            ->values();

        $recentTransactions = Transaction::with('user:id,name,role')
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'invoice_no' => $t->invoice_no,
                'datetime' => $t->created_at->format('d M Y H:i'),
                'cashier_name' => $t->user?->name ?? '-',
                'cashier_role' => $t->user?->role ?? '-',
                'payment_method' => $t->payment_method,
                'total' => (int) $t->total,
            ])
            ->values();

        $recentAttendance = Attendance::with('user:id,name,role')
            ->where('tenant_id', $tenantId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'datetime' => $a->created_at->format('d M H:i'),
                'user_name' => $a->user?->name ?? '-',
                'user_role' => $a->user?->role ?? '-',
                'type' => $a->type,
                'is_late' => (bool) $a->is_late,
            ])
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'sales_today_omzet' => (int) ($salesTodaySummary->omzet ?? 0),
                'sales_today_trx' => (int) ($salesTodaySummary->trx_count ?? 0),
                'sales_month_omzet' => (int) ($salesMonthSummary->omzet ?? 0),
                'sales_month_trx' => (int) ($salesMonthSummary->trx_count ?? 0),
                'sales_month_discount' => (int) ($salesMonthSummary->discount_total ?? 0),
                'attendance_today_count' => (int) $attendanceTodayCount,
                'attendance_today_late' => (int) $lateTodayCount,
                'employees_total' => (int) $activeEmployeeCount,
                'employees_present_today' => (int) $presentUsersToday,
                'shifts_today_count' => (int) $shiftTodayCount,
            ],
            'daily_sales' => $dailySales,
            'top_products' => $topProducts,
            'recent_transactions' => $recentTransactions,
            'recent_attendance' => $recentAttendance,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $tenantId = $request->user()->tenant_id;
        $today = Carbon::today();
        $from = $request->date('date_from')?->format('Y-m-d') ?? $today->copy()->startOfMonth()->format('Y-m-d');
        $to = $request->date('date_to')?->format('Y-m-d') ?? $today->format('Y-m-d');

        $query = Transaction::with('user:id,name,role')
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->orderByDesc('created_at');

        $filename = 'penjualan_'.$from.'_sd_'.$to.'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Jam', 'Invoice', 'Kasir', 'Role', 'Metode', 'Subtotal', 'Diskon', 'Total', 'Bayar', 'Kembalian']);

            $query->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->created_at->format('Y-m-d'),
                        $row->created_at->format('H:i:s'),
                        $row->invoice_no,
                        $row->user?->name ?? '-',
                        $row->user?->role ?? '-',
                        $row->payment_method,
                        $row->subtotal,
                        $row->discount,
                        $row->total,
                        $row->paid,
                        $row->change_amount,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}

