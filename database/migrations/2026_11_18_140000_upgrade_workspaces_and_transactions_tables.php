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
        Schema::table('workspaces', function (Blueprint $table) {
            if (!Schema::hasColumn('workspaces', 'type')) {
                $table->string('type')->default('personal')->after('name');
            }
            if (!Schema::hasColumn('workspaces', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('type');
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'status')) {
                $table->string('status')->default('completed')->after('type'); // completed, pending, voided
            }
            if (!Schema::hasColumn('transactions', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_active']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['status', 'deleted_at']);
        });
    }
};
