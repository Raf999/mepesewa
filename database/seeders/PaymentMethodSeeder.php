<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['name' => 'Cash',          'type' => 'cash'],
            ['name' => 'Bank Transfer', 'type' => 'bank_transfer'],
            ['name' => 'Mobile Money',  'type' => 'mobile_money'],
            ['name' => 'Card',          'type' => 'card'],
            ['name' => 'Other',         'type' => 'other'],
        ];

        foreach ($methods as $data) {
            PaymentMethod::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}

