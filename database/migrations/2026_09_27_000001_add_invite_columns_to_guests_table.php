<?php

use App\Models\Guest;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('invite_code', 16)->nullable()->unique();
            $table->timestamp('invite_sent_at')->nullable();
        });

        DB::table('guests')->whereNull('invite_code')->orderBy('id')->each(function (object $guest) {
            DB::table('guests')->where('id', $guest->id)->update(['invite_code' => Guest::newInviteCode()]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropUnique(['invite_code']);
            $table->dropColumn(['invite_code', 'invite_sent_at']);
        });
    }
};
