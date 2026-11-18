<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Expense categories
            ['name' => 'Food', 'type' => 'expense'],
            ['name' => 'Transportation', 'type' => 'expense'],
            ['name' => 'Housing', 'type' => 'expense'],
            ['name' => 'Utilities', 'type' => 'expense'],
            ['name' => 'Entertainment', 'type' => 'expense'],
            // Income categories
            ['name' => 'Salary', 'type' => 'income'],
            ['name' => 'Business', 'type' => 'income'],
            ['name' => 'Freelance', 'type' => 'income'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(['name' => $data['name'], 'type' => $data['type']], $data);
        }
    }
}

