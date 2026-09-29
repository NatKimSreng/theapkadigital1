<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $package = $request->query('package');

        return Inertia::render('admin/events', [
            'events' => Event::query()
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('groom_name', 'like', "%{$search}%")
                    ->orWhere('bride_name', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"))))
                ->when($package === 'free', fn ($query) => $query->whereNull('package_id'))
                ->when(is_numeric($package), fn ($query) => $query->where('package_id', (int) $package))
                ->with(['user:id,name,email', 'package:id,name,name_km'])
                ->withCount(['guests', 'rsvps', 'invitations'])
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'search' => $search,
            'package' => is_string($package) ? $package : '',
            'packages' => Package::query()->ordered()->where('is_default', false)->get(['id', 'name', 'name_km']),
        ]);
    }
}
