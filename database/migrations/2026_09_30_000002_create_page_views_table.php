<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Privacy-friendly visit log: no IP address, no cookie, only a
        // visitor code that changes every day.
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('path', 255)->index();
            $table->string('source', 120)->nullable()->index();
            $table->string('device', 10);
            $table->string('visitor', 16);
            $table->timestamp('created_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
