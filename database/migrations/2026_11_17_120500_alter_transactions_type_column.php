
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {

            // Remove the original enum CHECK constraint.
            DB::statement(
                'ALTER TABLE transactions
                 DROP CONSTRAINT IF EXISTS transactions_type_check'
            );

            // Convert the existing column to VARCHAR.
            DB::statement(
                'ALTER TABLE transactions
                 ALTER COLUMN type TYPE VARCHAR(20)
                 USING type::VARCHAR(20)'
            );

            // Set the default value.
            DB::statement(
                "ALTER TABLE transactions
                 ALTER COLUMN type SET DEFAULT 'expense'"
            );

        } else {

            Schema::table('transactions', function ($table) {
                $table->string('type', 20)
                    ->default('expense')
                    ->change();
            });

        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {

            DB::statement(
                'ALTER TABLE transactions
                 DROP CONSTRAINT IF EXISTS transactions_type_check'
            );

            DB::statement(
                "ALTER TABLE transactions
                 ADD CONSTRAINT transactions_type_check
                 CHECK (type IN ('income', 'expense'))"
            );

        } else {

            Schema::table('transactions', function ($table) {
                $table->enum('type', ['income', 'expense'])
                    ->change();
            });

        }
    }
};
