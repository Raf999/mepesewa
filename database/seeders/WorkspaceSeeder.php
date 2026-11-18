<?php

namespace Database\Seeders;

use App\Models\Workspace;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkspaceSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default workspace and a couple of sample workspaces for testing.
        Workspace::updateOrCreate(
            ['id' => 1],
            ['name' => 'Default Workspace']
        );

        Workspace::firstOrCreate(
            ['name' => 'Personal'],
            []
        );

        Workspace::firstOrCreate(
            ['name' => 'Business'],
            []
        );
    }
}
