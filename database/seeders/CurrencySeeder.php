<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            ['code' => 'GHS', 'name' => 'Ghanaian Cedi', 'symbol' => '₵'],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => '$'],
            ['code' => 'NGN', 'name' => 'Nigerian Naira', 'symbol' => '₦'],
        ];

        foreach ($currencies as $data) {
            Currency::updateOrCreate(['code' => $data['code']], $data);
        }
    }
}

