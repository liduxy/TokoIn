<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('device_id')->nullable()->constrained()->nullOnDelete();
    $table->string('invoice_no', 32)->unique();
    $table->unsignedBigInteger('subtotal')->default(0);
    $table->unsignedBigInteger('discount')->default(0);
    $table->unsignedBigInteger('total')->default(0);
    $table->unsignedBigInteger('paid')->default(0);
    $table->unsignedBigInteger('change_amount')->default(0);
    $table->string('payment_method', 16)->default('cash');
    $table->string('status', 16)->default('paid');
    $table->string('customer_name')->nullable();
    $table->string('note')->nullable();
    $table->timestamps();
    $table->index(['tenant_id', 'created_at']);
    $table->index(['tenant_id', 'status']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
