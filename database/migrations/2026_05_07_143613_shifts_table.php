<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('office_location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->date('shift_date');
            $table->time('shift_start');
            $table->time('shift_end');
            
            $table->enum('status', ['assigned', 'confirmed', 'completed', 'cancelled'])->default('assigned');
            $table->text('note')->nullable();
            
            $table->timestamps();
            
            // Index untuk query performa
            $table->index(['tenant_id', 'user_id', 'shift_date']);
            $table->index(['tenant_id', 'office_location_id', 'shift_date']);
            $table->unique(['user_id', 'shift_date', 'shift_start'], 'unique_user_shift_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};