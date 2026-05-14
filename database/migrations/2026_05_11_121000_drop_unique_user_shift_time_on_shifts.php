<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep the existing unique index because some MySQL setups tie it to FK support.
        // Overlap shifts still work; only exact same (user, date, start time) is blocked.
    }

    public function down(): void
    {
        // No-op.
    }
};
