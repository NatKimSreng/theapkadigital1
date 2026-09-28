<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('email');
            $table->timestamp('disabled_at')->nullable()->after('is_admin');
        });

        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_km')->nullable();
            $table->string('description', 500)->nullable();
            $table->string('description_km', 500)->nullable();
            $table->decimal('price', 10, 2)->default(0);
            // Null means unlimited.
            $table->unsignedInteger('guest_limit')->nullable();
            // Only read from the default (free) package: how many events a
            // user may have without a paid package.
            $table->unsignedInteger('event_limit')->nullable();
            $table->boolean('premium_templates')->default(false);
            $table->boolean('remove_branding')->default(false);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('package_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending')->index();
            $table->string('payment_method');
            $table->string('reference', 100)->nullable();
            $table->string('receipt_path')->nullable();
            $table->string('note', 500)->nullable();
            $table->string('admin_note', 500)->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        $now = now();

        DB::table('packages')->insert([
            [
                'name' => 'Free',
                'name_km' => 'ឥតគិតថ្លៃ',
                'description' => 'Try everything for one event.',
                'description_km' => 'សាកល្បងគ្រប់មុខងារសម្រាប់កម្មវិធីមួយ។',
                'price' => 0,
                'guest_limit' => 50,
                'event_limit' => 1,
                'premium_templates' => false,
                'remove_branding' => false,
                'is_default' => true,
                'is_featured' => false,
                'sort_order' => 0,
            ],
            [
                'name' => 'Basic',
                'name_km' => 'មូលដ្ឋាន',
                'description' => 'For small, intimate celebrations.',
                'description_km' => 'សម្រាប់ពិធីតូចៗ និងកក់ក្តៅ។',
                'price' => 9,
                'guest_limit' => 200,
                'event_limit' => null,
                'premium_templates' => false,
                'remove_branding' => true,
                'is_default' => false,
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium',
                'name_km' => 'ពិសេស',
                'description' => 'Everything most weddings need.',
                'description_km' => 'អ្វីៗដែលមង្គលការភាគច្រើនត្រូវការ។',
                'price' => 19,
                'guest_limit' => 500,
                'event_limit' => null,
                'premium_templates' => true,
                'remove_branding' => true,
                'is_default' => false,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'VIP',
                'name_km' => 'VIP',
                'description' => 'Unlimited guests for large weddings.',
                'description_km' => 'ភ្ញៀវមិនកំណត់ សម្រាប់មង្គលការធំៗ។',
                'price' => 39,
                'guest_limit' => null,
                'event_limit' => null,
                'premium_templates' => true,
                'remove_branding' => true,
                'is_default' => false,
                'is_featured' => false,
                'sort_order' => 3,
            ],
        ]);

        DB::table('packages')->update(['is_active' => true, 'created_at' => $now, 'updated_at' => $now]);
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');

        Schema::table('events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('package_id');
        });

        Schema::dropIfExists('packages');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_admin', 'disabled_at']);
        });
    }
};
