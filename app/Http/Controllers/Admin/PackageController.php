<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/packages', [
            'packages' => Package::query()->ordered()->withCount(['orders', 'events'])->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Package::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $package->update($this->validated($request, $package));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Package $package): RedirectResponse
    {
        if ($package->is_default || $package->orders()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.package_in_use']);

            return back();
        }

        $package->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Package $package = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'name_km' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'description_km' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0', 'max:100000'],
            'guest_limit' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'event_limit' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'premium_templates' => ['boolean'],
            'remove_branding' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        foreach (['premium_templates', 'remove_branding', 'is_featured', 'is_active'] as $flag) {
            $data[$flag] = $request->boolean($flag);
        }

        // The free plan always stays available.
        if ($package?->is_default) {
            $data['is_active'] = true;
        }

        $data['sort_order'] ??= 0;

        return $data;
    }
}
