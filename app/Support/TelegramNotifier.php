<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Posts site notifications (new orders, new sign-ups) to the admins'
 * Telegram group through the login bot. Never lets a Telegram problem
 * break the page that triggered it.
 */
class TelegramNotifier
{
    private const API = 'https://api.telegram.org/bot';

    public static function chatId(): ?string
    {
        return Setting::get('telegram_chat_id');
    }

    public static function enabled(): bool
    {
        return filled(config('services.telegram.bot_token')) && self::chatId() !== null;
    }

    /**
     * Sends text to the group, with a stored file attached when given.
     */
    public static function send(string $text, ?string $path = null, string $disk = 'local'): bool
    {
        if (! self::enabled()) {
            return false;
        }

        $url = self::API.config('services.telegram.bot_token');

        try {
            if ($path !== null && Storage::disk($disk)->exists($path)) {
                $response = Http::timeout(15)
                    ->attach('document', (string) Storage::disk($disk)->get($path), basename($path))
                    ->post("{$url}/sendDocument", [
                        'chat_id' => self::chatId(),
                        'caption' => Str::limit($text, 1000),
                    ]);
            } else {
                $response = Http::timeout(10)->post("{$url}/sendMessage", [
                    'chat_id' => self::chatId(),
                    'text' => Str::limit($text, 4000),
                    'disable_web_page_preview' => true,
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('Telegram notification failed: '.$e->getMessage());

            return false;
        }

        if (! $response->successful()) {
            Log::warning('Telegram notification failed: '.$response->json('description', 'HTTP '.$response->status()));
        }

        return $response->successful();
    }

    /**
     * Groups and channels the bot has seen lately (from getUpdates), so the
     * admin can pick theirs instead of hunting for its chat ID.
     *
     * @return list<array{id: string, title: string}>
     */
    public static function recentChats(): array
    {
        $token = config('services.telegram.bot_token');

        if (blank($token)) {
            return [];
        }

        try {
            $updates = Http::timeout(10)->get(self::API.$token.'/getUpdates')->json('result');
        } catch (Throwable) {
            return [];
        }

        $chats = [];

        foreach (is_array($updates) ? $updates : [] as $update) {
            foreach (['message', 'my_chat_member', 'channel_post', 'edited_message'] as $kind) {
                $chat = $update[$kind]['chat'] ?? null;

                if (is_array($chat) && in_array($chat['type'] ?? '', ['group', 'supergroup', 'channel'], true)) {
                    $chats[(string) $chat['id']] = ['id' => (string) $chat['id'], 'title' => (string) ($chat['title'] ?? $chat['id'])];
                }
            }
        }

        return array_values($chats);
    }
}
