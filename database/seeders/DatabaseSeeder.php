<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'is_admin' => true,
        ]);

        $event = $user->events()->create([
            'name' => 'ពិធីមង្គលការ សុខា & ស្រីនិច',
            'type' => 'wedding',
            'groom_name' => 'សុខា',
            'bride_name' => 'ស្រីនិច',
            'event_date' => now()->addMonths(2)->toDateString(),
            'venue' => 'Phnom Penh',
            'exchange_rate' => 4000,
            'budget' => 15000,
        ]);

        $guests = collect([
            ['name' => 'ចាន់ ដារា', 'side' => 'groom', 'group' => 'Family', 'status' => 'confirmed', 'party_size' => 2],
            ['name' => 'សុខ ពិសី', 'side' => 'bride', 'group' => 'Friends', 'status' => 'confirmed', 'party_size' => 1],
            ['name' => 'Kim Heng', 'side' => 'groom', 'group' => 'Work', 'status' => 'pending', 'party_size' => 2],
            ['name' => 'Srey Leak', 'side' => 'bride', 'group' => 'Family', 'status' => 'declined', 'party_size' => 1],
        ])->map(fn ($guest) => $event->guests()->create($guest));

        $event->gifts()->create(['guest_id' => $guests[0]->id, 'giver_name' => $guests[0]->name, 'amount_usd' => 100, 'method' => 'cash']);
        $event->gifts()->create(['guest_id' => $guests[1]->id, 'giver_name' => $guests[1]->name, 'amount_khr' => 200000, 'method' => 'aba']);

        $event->expenses()->create(['title' => 'Restaurant', 'category' => 'venue', 'estimated_amount' => 6000, 'actual_amount' => 2000, 'paid' => true]);
        $event->expenses()->create(['title' => 'Wedding dress', 'category' => 'attire', 'estimated_amount' => 1500, 'actual_amount' => 1200]);
        $event->expenses()->create(['title' => 'Photographer', 'category' => 'photo', 'estimated_amount' => 800]);

        $event->tasks()->create(['title' => 'Print invitations', 'due_date' => now()->addWeeks(2)->toDateString()]);
        $event->tasks()->create(['title' => 'Book the photographer', 'done' => true]);
    }
}
