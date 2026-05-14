<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $filters = $this->filters($request);

        $query = Transaction::with('user:id,name,role')
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid');

        $this->applyFilters($query, $filters);

        $transactions = $query->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $transactions->through(fn ($t) => [
            'id' => $t->id,
            'invoice_no' => $t->invoice_no,
            'date' => $t->created_at->format('d M Y'),
            'time' => $t->created_at->format('H:i:s'),
            'cashier' => $t->user ? [
                'id' => $t->user->id,
                'name' => $t->user->name,
                'role' => $t->user->role,
            ] : null,
            'payment_method' => $t->payment_method,
            'subtotal' => (int) $t->subtotal,
            'discount' => (int) $t->discount,
            'total' => (int) $t->total,
            'paid' => (int) $t->paid,
            'change_amount' => (int) $t->change_amount,
        ]);

        $summaryQuery = Transaction::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid');
        $this->applyFilters($summaryQuery, $filters);

        $summary = (clone $summaryQuery)
            ->selectRaw('COUNT(*) as trx_count, COALESCE(SUM(total),0) as omzet, COALESCE(SUM(discount),0) as discount_total, COALESCE(SUM(subtotal),0) as subtotal_total, COALESCE(SUM(paid),0) as paid_total')
            ->first();

        $paymentBreakdown = (clone $summaryQuery)
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END),0) as cash_total")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_method = 'qris' THEN total ELSE 0 END),0) as qris_total")
            ->first();

        $itemBase = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.status', 'paid');
        if ($filters['cashier_id']) {
            $itemBase->where('transactions.user_id', $filters['cashier_id']);
        }
        if ($filters['date_from']) {
            $itemBase->whereDate('transactions.created_at', '>=', $filters['date_from']);
        }
        if ($filters['date_to']) {
            $itemBase->whereDate('transactions.created_at', '<=', $filters['date_to']);
        }

        $itemsSold = (clone $itemBase)->sum('transaction_items.qty');

        $topProducts = (clone $itemBase)
            ->groupBy('transaction_items.product_name')
            ->orderByDesc(DB::raw('SUM(transaction_items.qty)'))
            ->limit(8)
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

        return Inertia::render('Sales/Report', [
            'filters' => $filters,
            'cashiers' => User::where('tenant_id', $tenantId)
                ->whereIn('role', [User::ROLE_KASIR, User::ROLE_ADMIN, User::ROLE_OWNER])
                ->orderBy('name')
                ->get(['id', 'name', 'role']),
            'summary' => [
                'trx_count' => (int) ($summary->trx_count ?? 0),
                'omzet' => (int) ($summary->omzet ?? 0),
                'discount_total' => (int) ($summary->discount_total ?? 0),
                'avg_ticket' => (int) ((int) ($summary->trx_count ?? 0) > 0 ? ((int) $summary->omzet / (int) $summary->trx_count) : 0),
                'items_sold' => (int) $itemsSold,
                'cash_total' => (int) ($paymentBreakdown->cash_total ?? 0),
                'qris_total' => (int) ($paymentBreakdown->qris_total ?? 0),
            ],
            'top_products' => $topProducts,
            'transactions' => [
                'data' => $transactions->items(),
                'links' => $transactions->linkCollection(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    private function filters(Request $request): array
    {
        $today = Carbon::today();
        return [
            'cashier_id' => $request->integer('cashier_id') ?: null,
            'date_from' => $request->date('date_from')?->format('Y-m-d') ?? $today->copy()->startOfMonth()->format('Y-m-d'),
            'date_to' => $request->date('date_to')?->format('Y-m-d') ?? $today->format('Y-m-d'),
            'payment_method' => in_array($request->string('payment_method')->toString(), ['cash', 'qris'], true)
                ? $request->string('payment_method')->toString()
                : null,
        ];
    }

    private function applyFilters($query, array $filters): void
    {
        if ($filters['cashier_id']) {
            $query->where('user_id', $filters['cashier_id']);
        }
        if ($filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if ($filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        if ($filters['payment_method']) {
            $query->where('payment_method', $filters['payment_method']);
        }
    }
}
