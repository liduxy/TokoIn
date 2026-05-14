<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('Admin/Users/Index', [
            'users' => User::where('tenant_id', $tenantId)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'employee_id', 'phone']),
            'roles' => $this->assignableRoles(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Form', [
            'user' => null,
            'roles' => $this->assignableRoles(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateInput($request);
        $data['tenant_id'] = $request->user()->tenant_id;
        $data['password'] = Hash::make($data['password']);

        User::create($data);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(Request $request, User $user): Response
    {
        $this->authorizeAccess($request, $user);

        return Inertia::render('Admin/Users/Form', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'employee_id', 'phone']),
            'roles' => $this->assignableRoles(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAccess($request, $user);

        $data = $this->validateInput($request, $user->id);
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->route('admin.users.index')->with('success', 'User diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAccess($request, $user);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Tidak bisa menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User dihapus.');
    }

    private function validateInput(Request $request, ?int $userId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'email' => ['required', 'email', 'max:191', Rule::unique('users', 'email')->ignore($userId)],
            'password' => $userId ? 'nullable|min:6' : 'required|min:6',
            'role' => ['required', Rule::in($this->assignableRoles())],
            'employee_id' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:30',
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function assignableRoles(): array
    {
        // Admin/owner cannot create master_dev or owner
        return [User::ROLE_ADMIN, User::ROLE_KASIR, User::ROLE_WAITERS];
    }

    private function authorizeAccess(Request $request, User $user): void
    {
        if ($user->tenant_id !== $request->user()->tenant_id) {
            abort(403);
        }
    }
}
