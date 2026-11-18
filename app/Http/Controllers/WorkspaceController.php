<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    /**
     * Display a list of workspaces and the create-workspace form.
     */
    public function index(): Response
    {
        $workspaces = Workspace::withCount(['financialAccounts'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Workspaces/Index', [
            'workspaces' => $workspaces,
        ]);
    }

    /**
     * Store a newly created workspace.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:workspaces,name',
            'type' => 'nullable|in:personal,business',
        ]);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'business',
            'is_active' => true,
        ]);

        if ($request->user()) {
            $workspace->users()->syncWithoutDetaching([
                $request->user()->id => ['role' => 'owner', 'status' => 'active'],
            ]);
        }

        return redirect()
            ->route('workspaces.index')
            ->with('success', 'Workspace created successfully.');
    }

    /**
     * Delete an existing workspace.
     */
    public function destroy(Workspace $workspace): RedirectResponse
    {
        if ($workspace->id === 1) {
            return redirect()
                ->route('workspaces.index')
                ->with('error', 'The default workspace cannot be deleted.');
        }

        $workspace->delete();

        return redirect()
            ->route('workspaces.index')
            ->with('success', 'Workspace deleted successfully.');
    }
}
