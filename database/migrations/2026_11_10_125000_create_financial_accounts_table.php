<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->foreignId('currency_id')->constrained('currencies');
            $table->string('name');
            $table->enum('type', ['cash', 'bank', 'mobile_money', 'e_wallet', 'other'])->default('cash');
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->date('opening_balance_date')->nullable();
            $table->string('institution')->nullable();
            $table->string('masked_identifier')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('include_in_totals')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_accounts');
    }
};
