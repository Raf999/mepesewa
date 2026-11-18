<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ensure the test user exists without violating the unique email constraint
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => Hash::make('secret')],
        );

        // Run core seeders
        $this->call([
            CurrencySeeder::class,
            CategorySeeder::class,
            PaymentMethodSeeder::class,
            WorkspaceSeeder::class,
        ]);
    }
}
