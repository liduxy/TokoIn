# TokoIn — Fase 1 (Multi-Tenant + Absensi React/Inertia)

Aplikasi SaaS retail untuk semua jenis toko (bakso, kelontong, retail, dll).
Fase 1 ini berisi pondasi multi-tenant + role-based access + modul absensi yang
sudah di-port ke React + TypeScript + Inertia.

**Modul Kasir (POS) dan Laporan Penjualan akan ditambahkan di Fase 2 & 3.**

## Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18 + TypeScript + Inertia.js (Breeze stack)
- **Build**: Vite 5.4 (kompatibel Node 22.9.0)
- **DB**: SQLite (dev). Bisa diganti MySQL/PostgreSQL via `.env`

## Aktor (Role)

| Role | Akses |
|---|---|
| `master_dev` | Kelola semua toko (lintas tenant), assign owner |
| `owner` | Owner 1 toko: kelola semua di tokonya termasuk admin |
| `admin` | Sama seperti owner kecuali tidak bisa hapus toko/owner |
| `kasir` | POS (Fase 2 — sekarang placeholder), absen, jadwal |
| `waiters` | Absen, jadwal, riwayat absen |

## Akun Demo (semua password: `password`)

### Master Dev
| Email | Role |
|---|---|
| `devops@tokoin.test` | master_dev |

### Toko 1 — Bakso Pak Joko (Bandung)
| Email | Role |
|---|---|
| `joko@tokoin.test` | owner |
| `admin.bakso@tokoin.test` | admin |
| `kasir.bakso@tokoin.test` | kasir |
| `budi@tokoin.test` | waiters |
| `siti@tokoin.test` | waiters |

### Toko 2 — Toko Kelontong Berkah (Surabaya)
| Email | Role |
|---|---|
| `ibu.berkah@tokoin.test` | owner |
| `admin.berkah@tokoin.test` | admin |
| `kasir.berkah@tokoin.test` | kasir |
| `agus@tokoin.test` | waiters |

## Setup

### Windows (XAMPP / PHP 8.2)

```cmd
cd "D:\path\ke\tokoin"
setup.bat
php artisan serve
```

### Linux / macOS

```bash
cd /path/ke/tokoin
chmod +x setup.sh
./setup.sh
php artisan serve
```

### Manual (kalau script gagal)

```bash
composer install
npm install
npm run build
copy .env.example .env       # Windows: copy   |  Linux: cp .env.example .env
php artisan key:generate
mkdir database 2>nul          # opsional
type nul > database\database.sqlite   # Windows; Linux: touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

Buka <http://127.0.0.1:8000>, login dengan akun demo di atas.

## Struktur Multi-Tenant

- Tabel `tenants` = 1 toko = 1 tenant.
- Setiap user (kecuali `master_dev`) terikat ke `tenants.id` via kolom `users.tenant_id`.
- Office locations & attendances juga punya `tenant_id`.
- Controller selalu memfilter query dengan `where('tenant_id', $request->user()->tenant_id)`,
  sehingga toko A tidak akan pernah melihat data toko B.
- `master_dev` punya `tenant_id = NULL` dan bisa lihat semua toko via menu "Toko".

## Fitur Fase 1

- Login Breeze + halaman React TSX
- Redirect dashboard berdasarkan role (`/dashboard` → routing per role)
- **Absensi**: foto selfie (`getUserMedia`) + GPS + geofence radius (server-side validasi)
- **Jadwal kerja**: jam masuk/pulang, toleransi telat, hari kerja per lokasi
- **Telat**: wajib alasan, otomatis ditandai TELAT
- **Pulang**: tidak bisa absen pulang sebelum jam pulang
- **Hari libur**: absen ditolak di hari non-kerja
- **Admin**: kelola karyawan, lokasi & jadwal, lihat semua absen + filter + export CSV
- **Master dev**: kelola toko, lihat statistik lintas toko

## Roadmap

- **Fase 2**: Modul Kasir (produk + kategori + transaksi + struk web/ESC-POS + QRIS) +
  Trusted Device (kasir hanya bisa di device toko)
- **Fase 3**: Laporan harian / bulanan / top product / dashboard owner

## Testing

```bash
php artisan test
```

32 test passing termasuk:
- 25 test bawaan Breeze (auth, profile, register, password reset)
- 7 test multi-tenant baru: role guard, tenant scope, redirect dashboard, haversine

## Catatan WebView Android

Untuk test kamera + GPS di WebView, butuh HTTPS production. Snippet
`MainActivity.java` & `AndroidManifest.xml` (handle `onPermissionRequest` &
`onGeolocationPermissionsShowPrompt`) tersedia di
[appendix Android WebView](#android-webview) — sama seperti di app absensi
sebelumnya.

### Android WebView (snippet)

```java
// MainActivity.java
webView.setWebChromeClient(new WebChromeClient() {
    @Override public void onPermissionRequest(PermissionRequest request) {
        request.grant(request.getResources());
    }
    @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
        cb.invoke(origin, true, false);
    }
});
WebSettings s = webView.getSettings();
s.setJavaScriptEnabled(true);
s.setDomStorageEnabled(true);
s.setMediaPlaybackRequiresUserGesture(false);
s.setGeolocationEnabled(true);
```

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```
