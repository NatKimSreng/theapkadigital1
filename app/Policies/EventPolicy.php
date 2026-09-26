<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    /**
     * Only the owner may view or manage an event and everything inside it.
     */
    public function manage(User $user, Event $event): bool
    {
        return $event->user_id === $user->id;
    }
}
