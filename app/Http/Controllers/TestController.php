<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Workspace;
use App\Models\FinancialAccount;
use App\Models\Category;
use App\Models\PaymentMethod;

class TestController extends Controller
{
    public function index()
    {
        $workspaces = Workspace::with('financialAccounts')->get();
        $categories = Category::all();
        $paymentMethods = PaymentMethod::all();

        return Inertia::render('Test/Index', [
            'workspaces' => $workspaces,
            'categories' => $categories,
            'paymentMethods' => $paymentMethods,
        ]);
    }
}

