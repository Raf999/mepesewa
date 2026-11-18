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
            $table->foreignId('workspace_id')->nullable()->constrained('workspaces')->nullOnDelete();
            $table->foreignId('source_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
            $table->foreignId('destination_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['workspace_id']);
            $table->dropForeign(['source_account_id']);
            $table->dropForeign(['destination_account_id']);
            $table->dropColumn(['workspace_id', 'source_account_id', 'destination_account_id']);
        });
    }
};
