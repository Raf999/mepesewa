<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_transactions_screen_requires_authentication(): void
    {
        $response = $this->get('/transactions');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_users_can_view_transactions_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/transactions');

        $response->assertStatus(200);
    }

    public function test_authenticated_users_can_create_a_transaction(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/transactions', [
            'type' => 'expense',
            'amount' => 150.50,
            'currency' => 'GHS',
            'category' => 'Food & Groceries',
            'description' => 'Supermarket shopping',
            'transaction_date' => '2026-11-09',
            'payment_method' => 'Mobile Money',
        ]);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'expense',
            'amount' => 150.50,
            'category' => 'Food & Groceries',
        ]);
    }
}

