<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function dashboard(Request $request): RedirectResponse
    {
        $user = $request->user();

        return match ($user->role) {
            User::ROLE_MASTER_DEV => redirect()->route('master.tenants.index'),
            User::ROLE_OWNER, User::ROLE_ADMIN => redirect()->route('admin.dashboard'),
            User::ROLE_KASIR => redirect()->route('kasir'),
            default => redirect()->route('attendance.index'),
        };
    }
}
