<?php

use App\Http\Controllers\Admin\AttendanceReportController as AdminAttendanceReportController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OfficeLocationController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShiftController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MasterDev\TenantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome');
// });

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [HomeController::class, 'dashboard'])
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:waiters,kasir,admin,owner'])->group(function () {
    Route::get('/absen', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/absen', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/riwayat', [AttendanceController::class, 'history'])->name('attendance.history');
    Route::get('/jadwal', [ScheduleController::class, 'index'])->name('schedule.index');
});

Route::middleware(['auth', 'role:admin,owner'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/export', [AdminDashboardController::class, 'export'])->name('export');
    Route::get('/rekap-karyawan', [AdminAttendanceReportController::class, 'index'])->name('attendance.report');

    Route::resource('users', AdminUserController::class)->except(['show']);
    Route::resource('offices', OfficeLocationController::class)->except(['show'])
        ->parameters(['offices' => 'office']);
    Route::post('categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::resource('products', ProductController::class)->except(['show']);
    Route::resource('shifts', ShiftController::class)->except(['show']);
    Route::post('/shifts/bulk-assign', [ShiftController::class, 'bulkAssign'])->name('shifts.bulk-assign');
});

Route::middleware(['auth', 'role:master_dev'])->prefix('master')->name('master.')->group(function () {
    Route::resource('tenants', TenantController::class)->except(['show']);
});

Route::middleware(['auth', 'role:kasir,admin,owner'])->group(function () {
    Route::get('/kasir', fn () => Inertia::render('Kasir/Index'))->name('kasir');
    Route::get('/penjualan', [SalesReportController::class, 'index'])->name('sales.report');
});

Route::middleware(['auth'])->prefix('api/kasir')->group(function () {
    Route::get('/products', [\App\Http\Controllers\Api\KasirController::class, 'products']);
    Route::get('/categories', [\App\Http\Controllers\Api\KasirController::class, 'categories']);
    Route::post('/transactions', [\App\Http\Controllers\Api\KasirController::class, 'store']);
    Route::get('/transactions', [\App\Http\Controllers\Api\KasirController::class, 'transactions']);
    Route::get('/transactions/{transaction}', [\App\Http\Controllers\Api\KasirController::class, 'show']);
});

require __DIR__.'/auth.php';

