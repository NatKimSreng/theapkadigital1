<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\TelegramNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        $values = Setting::values();

        foreach (Setting::FILES as $key) {
            $values[$key] = Setting::fileUrl($key);
        }

        return Inertia::render('admin/settings', [
            'settings' => $values,
            'defaults' => [
                'seo_title' => config('theapka.seo.title'),
                'seo_description' => config('theapka.seo.description'),
            ],
            'urls' => [
                'sitemap' => route('sitemap'),
                'robots' => route('robots'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'seo_title' => ['nullable', 'string', 'max:120'],
            'seo_description' => ['nullable', 'string', 'max:300'],
            'google_verification' => ['nullable', 'string', 'max:120', 'regex:/^[A-Za-z0-9_-]+$/'],
            'ga_id' => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,20}$/'],
            'facebook_url' => ['nullable', 'url:https', 'max:255'],
            'support_telegram' => ['nullable', 'string', 'max:64', 'regex:/^@?[A-Za-z0-9_]{3,64}$/'],
            // A group's numeric ID (groups are negative) or a channel's @name.
            'telegram_chat_id' => ['nullable', 'string', 'max:64', 'regex:/^(-?\d{5,20}|@[A-Za-z0-9_]{5,32})$/'],
            'payment_account_name' => ['nullable', 'string', 'max:120'],
            'payment_aba_number' => ['nullable', 'string', 'max:64'],
            'payment_bank_details' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'payment_khqr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove' => ['array'],
            'remove.*' => ['string'],
        ]);

        $values = Arr::except($data, [...Setting::FILES, 'remove']);

        foreach (Setting::FILES as $key) {
            $old = Setting::get($key);

            if ($request->hasFile($key)) {
                $values[$key] = PostController::storeUpload($request->file($key), 'site');
            } elseif (in_array($key, $data['remove'] ?? [], true)) {
                $values[$key] = null;
            } else {
                continue;
            }

            if ($old) {
                Storage::disk('public')->delete($old);
            }
        }

        Setting::put($values);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    /**
     * Groups the bot was recently added to or saw messages in.
     */
    public function telegramChats(): JsonResponse
    {
        return response()->json(['chats' => TelegramNotifier::recentChats()]);
    }

    public function telegramTest(): RedirectResponse
    {
        $sent = TelegramNotifier::send(__('Theapka notifications are working. New orders and sign-ups will appear here.'));

        Inertia::flash('toast', $sent
            ? ['type' => 'success', 'message' => 'toast.telegram_test_sent']
            : ['type' => 'error', 'message' => 'toast.telegram_test_failed']);

        return back();
    }
}
