<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Support\Seo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    /**
     * Max length of each editable text on an invitation.
     */
    private const TEXT_FIELDS = [
        'title' => 120,
        'host_left' => 120,
        'host_right' => 120,
        'joiner' => 30,
        'invite_line' => 120,
        'guest_name' => 120,
        'date_text' => 200,
        'venue_text' => 255,
        'message_title' => 200,
        'message' => 2000,
        'thanks_title' => 200,
        'thanks' => 2000,
        'groom_parents' => 300,
        'bride_parents' => 300,
    ];

    private const LANGUAGES = ['km', 'en'];

    private const MUSIC_MAX_KB = 15360;

    private const IMAGE_MAX_KB = 5120;

    /**
     * The design editor for the event's invitations.
     */
    public function index(Request $request, Event $event): Response
    {
        Gate::authorize('manage', $event);

        $invitations = $event->invitations()->oldest()->get();
        $selected = $invitations->firstWhere('id', (int) $request->query('invitation'))
            ?? $invitations->firstWhere('is_active', true)
            ?? $invitations->first();

        return Inertia::render('events/invitations', [
            'event' => $event,
            'invitations' => $invitations,
            'selectedId' => $selected?->id,
            'guests' => $event->guests()->orderBy('name')->get(['id', 'name', 'invite_code']),
            'uploadLimits' => $this->uploadLimits(),
        ]);
    }

    /**
     * The template catalog where templates are added to the event.
     */
    public function catalog(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/templates', [
            'event' => $event,
            'added' => $event->invitations()->pluck('id', 'template'),
            'max' => $event->plan()->templateLimit(),
            'premiumUnlocked' => $event->plan()->unlocksPremiumTemplates(),
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $validated = $request->validate([
            'template' => [
                'required',
                Rule::in(Invitation::TEMPLATES),
                Rule::unique('invitations')->where('event_id', $event->id),
            ],
        ]);

        if (in_array($validated['template'], Invitation::PREMIUM_TEMPLATES, true) && ! $event->plan()->unlocksPremiumTemplates()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.premium_required']);

            return back();
        }

        $count = $event->invitations()->count();
        $limit = $event->plan()->templateLimit();

        if ($limit !== null && $count >= $limit) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.template_limit']);

            return back();
        }

        $invitation = $event->invitations()->create([
            'template' => $validated['template'],
            'settings' => [],
            'is_active' => $count === 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.template_added']);

        return to_route('events.invitations.index', [$event, 'invitation' => $invitation->id]);
    }

    public function update(Request $request, Event $event, Invitation $invitation): RedirectResponse
    {
        Gate::authorize('manage', $event);

        // The editor sends settings as one JSON string so that empty lists and
        // booleans survive the multipart upload.
        if (is_string($request->input('settings'))) {
            $request->merge(['settings' => json_decode($request->input('settings'), true) ?? []]);
        }

        $rules = [
            'settings' => ['nullable', 'array'],
            'settings.texts' => ['nullable', 'array'],
            'settings.agenda' => ['nullable', 'array', 'max:20'],
            'settings.agenda.*.time' => ['nullable', 'string', 'max:50'],
            'settings.primary_color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'settings.secondary_color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'settings.gold_text' => ['nullable', 'boolean'],
            'settings.hide_hosts' => ['nullable', 'boolean'],
            'settings.map_url' => ['nullable', 'url:https', 'max:500'],
            'settings.language' => ['nullable', Rule::in(self::LANGUAGES)],
            'settings.languages' => ['nullable', Rule::in(['both', ...self::LANGUAGES])],
            'settings.event_time' => ['nullable', 'date_format:H:i'],
            'settings.show_countdown' => ['nullable', 'boolean'],
            'settings.opening' => ['nullable', Rule::in(['doors', 'envelope', 'curtain', 'fade', 'seal'])],
            'settings.effect' => ['nullable', Rule::in(['none', 'petals', 'sparkles', 'hearts'])],
            'settings.gift' => ['nullable', 'array'],
        ];

        foreach (['usd', 'khr'] as $currency) {
            $rules["settings.gift.{$currency}.name"] = ['nullable', 'string', 'max:100'];
            $rules["settings.gift.{$currency}.number"] = ['nullable', 'string', 'max:50'];
            $rules["settings.gift.{$currency}.link"] = ['nullable', 'url:https', 'max:500'];
        }

        foreach (self::LANGUAGES as $lang) {
            $rules["settings.agenda.*.{$lang}"] = ['nullable', 'string', 'max:200'];

            foreach (self::TEXT_FIELDS as $field => $max) {
                $rules["settings.texts.{$lang}.{$field}"] = ['nullable', 'string', "max:{$max}"];
            }
        }

        foreach (Invitation::MEDIA as $key) {
            // mimes checks the detected content type: AAC is detected as "adts"
            // and some M4A files as "mp4", so both are allowed alongside the
            // filename check.
            $rules[$key] = $key === 'music'
                ? ['nullable', 'file', 'mimes:mp3,mpga,m4a,mp4,aac,adts,ogg,oga,wav', 'extensions:mp3,m4a,aac,ogg,wav', 'max:'.self::MUSIC_MAX_KB]
                : ['nullable', 'image', 'max:'.self::IMAGE_MAX_KB];
            $rules["remove_{$key}"] = ['nullable', 'boolean'];
        }

        $rules['gallery'] = ['nullable', 'array', 'max:'.Invitation::MAX_GALLERY];
        $rules['gallery.*'] = ['image', 'max:'.self::IMAGE_MAX_KB];
        $rules['remove_gallery'] = ['nullable', 'array'];
        $rules['remove_gallery.*'] = ['string'];

        $tooLarge = __('This file is larger than the server accepts (maximum :max MB).', [
            'max' => round(self::iniBytes('upload_max_filesize') / 1024 / 1024, 1),
        ]);
        $messages = ['gallery.*.uploaded' => $tooLarge];

        foreach (Invitation::MEDIA as $key) {
            $messages["{$key}.uploaded"] = $tooLarge;
        }

        $validated = $request->validate($rules, $messages);

        $incoming = $validated['settings'] ?? [];

        foreach (['gold_text', 'hide_hosts', 'show_countdown'] as $flag) {
            if (array_key_exists($flag, $incoming)) {
                $incoming[$flag] = (bool) $incoming[$flag];
            }
        }

        $settings = array_merge($invitation->settings ?? [], $incoming);

        foreach (Invitation::MEDIA as $key) {
            if ($request->hasFile($key) || $request->boolean("remove_{$key}")) {
                $invitation->deleteMedia($key);
                $settings["{$key}_path"] = $request->hasFile($key)
                    ? $request->file($key)->store("invitations/{$invitation->id}", 'public')
                    : null;
            }
        }

        $removed = array_intersect($invitation->galleryPaths(), $validated['remove_gallery'] ?? []);
        $kept = array_values(array_diff($invitation->galleryPaths(), $removed));
        $uploads = $request->file('gallery', []);

        if (count($kept) + count($uploads) > Invitation::MAX_GALLERY) {
            throw ValidationException::withMessages([
                'gallery' => __('validation.max.array', ['attribute' => 'gallery', 'max' => Invitation::MAX_GALLERY]),
            ]);
        }

        Storage::disk('public')->delete($removed);

        foreach ($uploads as $file) {
            $kept[] = $file->store("invitations/{$invitation->id}/gallery", 'public');
        }

        $settings['gallery_paths'] = $kept;

        $invitation->update(['settings' => $settings]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    /**
     * Make this invitation the one guests see.
     */
    public function activate(Event $event, Invitation $invitation): RedirectResponse
    {
        Gate::authorize('manage', $event);

        DB::transaction(function () use ($event, $invitation) {
            $event->invitations()->update(['is_active' => false]);
            $invitation->update(['is_active' => true]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Event $event, Invitation $invitation): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $invitation->delete();

        if ($invitation->is_active) {
            $event->invitations()->oldest()->first()?->update(['is_active' => true]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return to_route('events.invitations.index', $event);
    }

    /**
     * The public invitation page shared with guests.
     */
    public function share(Request $request, Invitation $invitation): Response
    {
        return $this->renderPublic(
            $request,
            $invitation,
            $request->string('to')->limit(120, '')->toString() ?: null,
        );
    }

    /**
     * A guest's personal link: the event's invitation in use, addressed to them.
     */
    public function guest(Request $request, Guest $guest): Response
    {
        $invitation = $guest->event->invitations()->orderByDesc('is_active')->oldest()->first();

        abort_if($invitation === null, 404);

        return $this->renderPublic($request, $invitation, $guest->name, $guest);
    }

    private function renderPublic(Request $request, Invitation $invitation, ?string $guestName, ?Guest $guest = null): Response
    {
        $event = $invitation->event;
        $reply = $guest ? $event->rsvps()->where('guest_id', $guest->id)->first() : null;

        $couple = collect([$event->groom_name, $event->bride_name])->filter()->implode(' & ');
        $details = collect([
            $event->event_date?->translatedFormat('j F Y'),
            $event->venue,
        ])->filter()->implode(' · ');

        // Invitations are private: rich previews when shared, but never indexed.
        $seo = new Seo(
            title: $couple !== '' ? $couple : $event->name,
            description: trim(($guestName ? __('Dear :name, you are invited.', ['name' => $guestName]).' ' : '').$details) ?: __('You are invited.'),
            image: $invitation->media['cover'] ?? $invitation->media['gallery'][0] ?? null,
            url: url()->current(),
        );

        return Inertia::render('invitation', [
            'event' => [
                ...$event->only(['id', 'name', 'type', 'groom_name', 'bride_name', 'venue']),
                'event_date' => $event->event_date?->format('Y-m-d'),
            ],
            'invitation' => $invitation->only(['template', 'settings', 'media']),
            'guestName' => $guestName,
            'branding' => ! $event->plan()->remove_branding,
            'rsvp' => [
                'url' => route('invitations.rsvp', $invitation->public_id),
                'guest' => $guest?->invite_code,
                'reply' => $reply?->only(['attending', 'message']),
            ],
            'lang' => in_array($request->query('lang'), self::LANGUAGES, true) ? $request->query('lang') : null,
        ])->withViewData('seo', $seo);
    }

    /**
     * Largest files the editor may send, in bytes: the app's own limits
     * capped by what this PHP install accepts.
     *
     * @return array{music: int, image: int, total: int}
     */
    private function uploadLimits(): array
    {
        $perFile = self::iniBytes('upload_max_filesize');

        return [
            'music' => min(self::MUSIC_MAX_KB * 1024, $perFile),
            'image' => min(self::IMAGE_MAX_KB * 1024, $perFile),
            'total' => self::iniBytes('post_max_size'),
        ];
    }

    private static function iniBytes(string $key): int
    {
        $value = trim((string) ini_get($key));
        $number = (int) $value;

        if ($number <= 0) {
            return PHP_INT_MAX;
        }

        return match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
