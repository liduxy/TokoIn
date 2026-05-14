#!/usr/bin/env bash
set -e

echo "=== TokoIn Setup (Linux/macOS) ==="

[ -f .env ] || cp .env.example .env
[ -f database/database.sqlite ] || touch database/database.sqlite

echo ""
echo "[1/5] composer install..."
composer install

echo ""
echo "[2/5] php artisan key:generate..."
php artisan key:generate

echo ""
echo "[3/5] npm install..."
npm install

echo ""
echo "[4/5] npm run build..."
npm run build

echo ""
echo "[5/5] migrate:fresh --seed + storage:link..."
php artisan migrate:fresh --seed
php artisan storage:link

echo ""
echo "=== Setup selesai ==="
echo "Jalankan: php artisan serve"
echo "Login: lihat README.md (semua password: password)"
