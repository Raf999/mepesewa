<?php

namespace App\Actions\Fortify;

use App\Models\Currency;
use App\Models\FinancialAccount;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user with personal workspace.
     *
     * @param  array<string, string>  $input
     *
     * @throws ValidationException
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
            ]);

            // Create personal workspace for the user
            $workspace = Workspace::create([
                'name' => $user->name . "'s Personal Workspace",
                'type' => 'personal',
                'is_active' => true,
            ]);

            $workspace->users()->attach($user->id, [
                'role' => 'owner',
                'status' => 'active',
            ]);

            // Create default cash wallet for the new workspace
            $defaultCurrency = Currency::where('code', 'GHS')->first() ?? Currency::first();
            if ($defaultCurrency) {
                FinancialAccount::create([
                    'workspace_id' => $workspace->id,
                    'currency_id' => $defaultCurrency->id,
                    'name' => 'Cash Wallet',
                    'type' => 'cash',
                    'opening_balance' => 0,
                    'opening_balance_date' => now()->toDateString(),
                    'is_active' => true,
                    'include_in_totals' => true,
                ]);
            }

            return $user;
        });
    }
}
