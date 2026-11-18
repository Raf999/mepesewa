<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class IncomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_income_screen_requires_authentication(): void
    {
        $response = $this->get('/income');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_users_can_view_income_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/income');

        $response->assertStatus(200);
    }

    public function test_income_screen_displays_user_incomes_and_stats(): void
    {
        $user = User::factory()->create();

        // Income transaction
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'income',
            'amount' => 5000,
            'currency' => 'GHS',
            'category' => 'Salary',
            'transaction_date' => now()->toDateString(),
        ]);

        // Expense transaction (should not appear in income list)
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'expense',
            'amount' => 200,
            'currency' => 'GHS',
            'category' => 'Food',
            'transaction_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->get('/income');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Income/Index')
            ->has('incomes.data', 1)
            ->where('incomes.data.0.type', 'income')
            ->where('stats.total', 5000)
            ->where('stats.this_month', 5000)
        );
    }
}

