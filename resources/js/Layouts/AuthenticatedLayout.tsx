import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { PageProps, Role } from '@/types';

import {
    LayoutDashboard,
    Users,
    MapPin,
    Clock3,
    BarChart3,
    Package,
    CreditCard,
    ClipboardCheck,
    History,
    CalendarDays,
    Store,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronUp,
    UserCircle2,
    Settings,
    Globe,
    LogOut,
    Shield,
} from 'lucide-react';

type NavItem = {
    label: string;
    routeName: string;
    roles: Role[];
    icon: any;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Toko', routeName: 'master.tenants.index', roles: ['master_dev'], icon: Store },
    { label: 'Dashboard', routeName: 'admin.dashboard', roles: ['owner', 'admin'], icon: LayoutDashboard },
    { label: 'Karyawan', routeName: 'admin.users.index', roles: ['owner', 'admin'], icon: Users },
    { label: 'Lokasi & Jadwal', routeName: 'admin.offices.index', roles: ['owner', 'admin'], icon: MapPin },
    { label: 'Jadwal Shift', routeName: 'admin.shifts.index', roles: ['owner', 'admin'], icon: Clock3 },
    { label: 'Rekap Karyawan', routeName: 'admin.attendance.report', roles: ['owner', 'admin'], icon: BarChart3 },
    { label: 'Produk', routeName: 'admin.products.index', roles: ['owner', 'admin'], icon: Package },
    { label: 'Kasir (POS)', routeName: 'kasir', roles: ['kasir', 'admin', 'owner'], icon: CreditCard },
    { label: 'Rekap Penjualan', routeName: 'sales.report', roles: ['kasir', 'admin', 'owner'], icon: BarChart3 },
    { label: 'Absen', routeName: 'attendance.index', roles: ['waiters', 'kasir', 'admin', 'owner'], icon: ClipboardCheck },
    { label: 'Riwayat Absen Saya', routeName: 'attendance.history', roles: ['waiters', 'kasir', 'admin', 'owner'], icon: History },
    { label: 'Jadwal', routeName: 'schedule.index', roles: ['waiters', 'kasir', 'admin', 'owner'], icon: CalendarDays },
];

function formatWIB(date: Date): string {
    return date.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(',', '');
}

function isRouteActive(current: string, target: string) {
    if (current === target) return true;
    const parts = target.split('.');
    if (parts.length < 2) return false;

    const base = `${parts[0]}.${parts[1]}`;
    return new RegExp(`^${base.replace(/\./g, '\\.')}(\\..*)?$`).test(current);
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>();
    const { auth, flash, app } = page.props;

    const { user, tenant } = auth;
    const appName = app?.name || 'TokoIn';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const items = NAV_ITEMS.filter(i => i.roles.includes(user.role));

    const MenuItems = ({ mobile = false }) => (
        <nav className="space-y-1">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        key={item.routeName}
                        href={route(item.routeName)}
                        onClick={() => mobile && setMobileOpen(false)}
                        className={`
                            flex items-center
                            ${collapsed && !mobile ? 'justify-center' : 'gap-3'}
                            px-3 py-3 rounded-xl text-sm transition
                            ${isRouteActive(route().current() || '', item.routeName)
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'hover:bg-gray-50'
                            }
                        `}
                    >
                        <Icon className="h-5 w-5" />
                        {(!collapsed || mobile) && <span>{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            master_dev: 'bg-purple-100 text-purple-700 border-purple-200',
            owner: 'bg-amber-100 text-amber-700 border-amber-200',
            admin: 'bg-blue-100 text-blue-700 border-blue-200',
            kasir: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            waiters: 'bg-pink-100 text-pink-700 border-pink-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            master_dev: 'Master Developer',
            owner: 'Owner',
            admin: 'Admin',
            kasir: 'Kasir',
            waiters: 'Waiter/Waitress',
        };
        return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex min-h-screen">

                {/* desktop sidebar */}
                <aside
                    className={`
                        hidden sm:flex flex-col h-screen sticky top-0
                        bg-white border-r shadow-sm
                        transition-all duration-300
                        ${collapsed ? 'w-20' : 'w-70'}
                    `}
                >
                    {/* header */}
                    <div className="p-4 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-3"
                            >
                                <img
                                    src="/assets/images/logotokoin.png"
                                    className="h-10 w-10 rounded-xl"
                                    alt="Logo"
                                />

                                {!collapsed && (
                                    <h1 className="text-lg font-bold text-indigo-600">
                                        {appName}
                                    </h1>
                                )}
                            </Link>

                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                {collapsed
                                    ? <PanelLeftOpen size={18} />
                                    : <PanelLeftClose size={18} />}
                            </button>
                        </div>

                        {!collapsed && tenant && (
                            <p className="text-xs text-gray-500 mt-3">
                                Toko:
                                <span className="ml-1 font-semibold">
                                    {tenant.name}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* menu */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <MenuItems />
                    </div>

                    {/* footer user */}
                    <div className="border-t bg-white/80 backdrop-blur-sm p-3 shrink-0">
                        {/* Role Badge - Displayed Above User */}
                        {!collapsed && (
                            <div className="mb-3">
                                <div className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 
                                    rounded-lg text-xs font-medium border
                                    ${getRoleBadgeColor(user.role)}
                                `}>
                                    <Shield size={12} />
                                    {formatRoleLabel(user.role)}
                                </div>
                            </div>
                        )}

                        {/* User Dropdown */}
                        {/* User Dropdown */}
                        <div className="relative">

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        aria-label="Menu pengguna"
                                    >
                                        <div className="h-9 w-9 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>

                                        {!collapsed && (
                                            <>
                                                <div className="min-w-0 flex-1 text-left">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                <ChevronUp className="h-4 w-4 text-gray-400 transition-transform group-hover:text-gray-600" />
                                            </>
                                        )}
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content
                                    align="right"
                                    width="48"
                                    className="bottom-full right-0 mb-3 !top-auto origin-bottom-right"
                                >
                                    {/* Header Profil */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    {/* Grup Menu Utama */}
                                    <div className="py-1">
                                        <Dropdown.Link href={route('profile.edit')}>
                                            <div className="flex items-center gap-2.5 px-1 py-0.5">
                                                <UserCircle2 size={16} className="text-gray-500" />
                                                <span className="text-sm">Pengaturan Akun</span>
                                            </div>
                                        </Dropdown.Link>
                                        {/* <Dropdown.Link href={route('dashboard')}>
                                        <div className="flex items-center gap-2.5 px-1 py-0.5">
                                            <Globe size={16} className="text-gray-500" />
                                            <span className="text-sm">Landing Page</span>
                                        </div>
                                    </Dropdown.Link> */}
                                    </div>

                                    {/* Grup Logout (Dipisah Divider) */}
                                    <div className="border-t border-gray-100 py-1">
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <div className="flex items-center gap-2.5 px-1 py-0.5 text-red-600">
                                                <LogOut size={16} />
                                                <span className="text-sm">Keluar</span>
                                            </div>
                                        </Dropdown.Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </aside>

                {/* main */}
                <div className="flex-1 flex flex-col min-w-0">
                    <nav className="h-16 bg-white border-b sticky top-0 z-40 shadow-sm">
                        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    className="sm:hidden"
                                    onClick={() => setMobileOpen(true)}
                                >
                                    <Menu className="h-6 w-6" />
                                </button>

                                {header}
                            </div>

                            <div className="text-xs font-mono bg-gray-100 px-3 py-2 rounded-lg">
                                {formatWIB(time)} WIB
                            </div>
                        </div>
                    </nav>

                    {flash?.success && (
                        <div className="m-4 rounded bg-green-50 border border-green-300 px-4 py-3">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="m-4 rounded bg-red-50 border border-red-300 px-4 py-3">
                            {flash.error}
                        </div>
                    )}

                    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>

            {/* mobile */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 sm:hidden">
                    <button
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />

                    <aside className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white shadow-xl flex flex-col">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-3"
                                >
                                    <img
                                        src="/assets/images/logotokoin.png"
                                        className="h-10 w-10 rounded-xl"
                                        alt="Logo"
                                    />
                                    <h1 className="font-bold text-indigo-600">
                                        {appName}
                                    </h1>
                                </Link>

                                <button onClick={() => setMobileOpen(false)}>
                                    <X />
                                </button>
                            </div>

                            {tenant && (
                                <p className="text-xs text-gray-500 mt-3">
                                    Toko:
                                    <span className="ml-1 font-semibold">
                                        {tenant.name}
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            <MenuItems mobile />
                        </div>

                        <div className="border-t p-4">
                            {/* Mobile Role Badge */}
                            <div className="mb-3">
                                <div className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 
                                    rounded-lg text-xs font-medium border
                                    ${getRoleBadgeColor(user.role)}
                                `}>
                                    <Shield size={12} />
                                    {formatRoleLabel(user.role)}
                                </div>
                            </div>

                            <div className="font-semibold text-sm mb-1">
                                {user.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                                {user.email}
                            </div>

                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                onClick={() => setMobileOpen(false)}
                            >
                                Pengaturan
                            </ResponsiveNavLink>

                            <ResponsiveNavLink
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setMobileOpen(false)}
                            >
                                Keluar
                            </ResponsiveNavLink>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}