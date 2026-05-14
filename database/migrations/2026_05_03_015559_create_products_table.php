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
        Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');
    $table->string('sku', 64)->nullable();
    $table->unsignedBigInteger('price')->default(0);
    $table->boolean('track_stock')->default(false);
    $table->integer('stock')->default(0);
    $table->boolean('is_active')->default(true);
    $table->string('image_path')->nullable();
    $table->timestamps();
    $table->index(['tenant_id', 'is_active']);
    $table->index(['tenant_id', 'category_id']);
    $table->unique(['tenant_id', 'sku']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
