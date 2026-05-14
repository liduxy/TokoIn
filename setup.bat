@echo off
setlocal

echo === TokoIn Setup (Windows) ===
echo.

if not exist .env (
    copy .env.example .env
    echo .env dibuat dari .env.example
)

if not exist database\database.sqlite (
    type nul > database\database.sqlite
    echo database\database.sqlite dibuat
)

echo.
echo [1/5] composer install...
call composer install
if errorlevel 1 goto :err

echo.
echo [2/5] php artisan key:generate...
call php artisan key:generate

echo.
echo [3/5] npm install...
call npm install
if errorlevel 1 goto :err

echo.
echo [4/5] npm run build...
call npm run build
if errorlevel 1 goto :err

echo.
echo [5/5] migrate:fresh --seed + storage:link...
call php artisan migrate:fresh --seed
call php artisan storage:link

echo.
echo === Setup selesai ===
echo Jalankan: php artisan serve
echo Login: lihat README.md (semua password: password)
goto :eof

:err
echo.
echo Setup gagal. Cek pesan error di atas.
exit /b 1
