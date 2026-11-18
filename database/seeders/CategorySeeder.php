<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

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

        $workspaces = Workspace::all();

        foreach ($workspaces as $workspace) {
            foreach ($categories as $data) {
                Category::updateOrCreate(
                    [
                        'workspace_id' => $workspace->id,
                        'name' => $data['name'],
                        'type' => $data['type'],
                    ],
                    [
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
