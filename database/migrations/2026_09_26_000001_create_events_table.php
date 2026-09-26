<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('wedding');
            $table->string('groom_name')->nullable();
            $table->string('bride_name')->nullable();
            $table->date('event_date')->nullable();
            $table->string('venue')->nullable();
            $table->unsignedInteger('exchange_rate')->default(4000);
            $table->decimal('budget', 12, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('side')->default('both');
            $table->string('group')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedSmallInteger('party_size')->default(1);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('gifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained()->nullOnDelete();
            $table->string('giver_name');
            $table->decimal('amount_usd', 12, 2)->default(0);
            $table->unsignedBigInteger('amount_khr')->default(0);
            $table->string('method')->default('cash');
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category')->default('other');
            $table->string('vendor')->nullable();
            $table->decimal('estimated_amount', 12, 2)->default(0);
            $table->decimal('actual_amount', 12, 2)->default(0);
            $table->boolean('paid')->default(false);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->date('due_date')->nullable();
            $table->boolean('done')->default(false);
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('gifts');
        Schema::dropIfExists('guests');
        Schema::dropIfExists('events');
    }
};
