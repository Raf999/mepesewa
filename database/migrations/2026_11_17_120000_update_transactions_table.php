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
        Schema::table('transactions', function (Blueprint $table) {
            // Add new foreign key columns
            $table->unsignedBigInteger('currency_id')->default(1); // assuming a default currency exists
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('payment_method_id')->nullable();
            $table->unsignedBigInteger('destination_currency_id')->nullable();

            // Create foreign key constraints
            $table->foreign('currency_id')->references('id')->on('currencies')->onDelete('restrict');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('set null');
            $table->foreign('destination_currency_id')->references('id')->on('currencies')->onDelete('set null');

            // Drop old string columns
            $table->dropColumn(['currency', 'category', 'payment_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Re-add old columns
            $table->string('currency', 3)->default('GHS');
            $table->string('category')->nullable();
            $table->string('payment_method')->nullable();

            // Drop new columns and foreign keys
            $table->dropForeign(['currency_id']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['payment_method_id']);
            $table->dropForeign(['destination_currency_id']);
            $table->dropColumn(['currency_id', 'category_id', 'payment_method_id', 'destination_currency_id']);
        });
    }
};
