<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Package;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TelegramNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private const GROUP = '-1001234567890';

    /** @var list<array<string, mixed>> What getUpdates answers. */
    private array $updates = [];

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.telegram.bot_token' => '123456:test-bot-token',
            'services.telegram.bot_username' => 'theapka_bot',
            'theapka.payment.telegram' => null,
        ]);
        Http::fake(fn (Request $request) => Http::response(str_ends_with($request->url(), '/getUpdates')
            ? ['ok' => true, 'result' => $this->updates]
            : ['ok' => true]));
    }

    public function test_a_new_order_is_posted_to_the_group_with_its_receipt()
    {
        Storage::fake('local');
        Setting::put(['telegram_chat_id' => self::GROUP]);
        $user = User::factory()->create(['name' => 'Dara']);
        $event = $user->events()->create(['name' => 'Dara wedding', 'exchange_rate' => 4000]);

        $this->actingAs($user)->post(route('checkout.store', Package::where('name', 'Premium')->firstOrFail()), [
            'event_id' => $event->id,
            'payment_method' => 'aba',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ]);

        $order = Order::firstOrFail();

        Http::assertSent(function (Request $request) use ($order) {
            $parts = collect($request->data())->pluck('contents', 'name');

            return str_ends_with($request->url(), '/sendDocument')
                && $parts['chat_id'] === self::GROUP
                && str_contains((string) $parts['caption'], "#{$order->id}")
                && str_contains((string) $parts['caption'], 'Dara wedding');
        });
    }

    public function test_a_new_sign_up_is_posted_to_the_group()
    {
        Setting::put(['telegram_chat_id' => self::GROUP]);

        User::factory()->create(['name' => 'Sokha', 'email' => 'sokha@example.com']);

        Http::assertSent(fn (Request $request) => str_ends_with($request->url(), '/sendMessage')
            && $request['chat_id'] === self::GROUP
            && str_contains($request['text'], 'Sokha'));
    }

    public function test_nothing_is_sent_until_a_group_is_chosen()
    {
        User::factory()->create();

        Http::assertNothingSent();
    }

    public function test_admins_can_find_the_groups_the_bot_is_in()
    {
        $this->updates = [
            ['update_id' => 1, 'my_chat_member' => ['chat' => ['id' => -1001234567890, 'title' => 'Theapka orders', 'type' => 'supergroup']]],
            ['update_id' => 2, 'message' => ['chat' => ['id' => 42, 'first_name' => 'Dara', 'type' => 'private']]],
        ];

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->getJson(route('admin.settings.telegram-chats'))
            ->assertOk()
            ->assertExactJson(['chats' => [['id' => self::GROUP, 'title' => 'Theapka orders']]]);

        $this->actingAs(User::factory()->create())
            ->getJson(route('admin.settings.telegram-chats'))
            ->assertForbidden();
    }
}
