<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Package payments
    |--------------------------------------------------------------------------
    |
    | Customers pay by transfer and upload a receipt; an admin approves the
    | order. These details are shown on the checkout page.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Search engines and link previews
    |--------------------------------------------------------------------------
    |
    | Defaults for the home page title and description; the admin can
    | override both under Site settings.
    |
    */

    'seo' => [
        'title' => env('SEO_TITLE', 'Theapka — ធៀបការឌីជីថល និងកម្មវិធីរៀបចំមង្គលការ'),
        'description' => env('SEO_DESCRIPTION', 'បង្កើតធៀបការឌីជីថលដ៏ស្រស់ស្អាត គ្រប់គ្រងបញ្ជីភ្ញៀវ ចំណងដៃ និងការឆ្លើយតប (RSVP) សម្រាប់ពិធីមង្គលការ និងកម្មវិធីផ្សេងៗ — ងាយស្រួល រហ័ស និងជាភាសាខ្មែរ។'),
    ],

    'payment' => [
        'account_name' => env('PAYMENT_ACCOUNT_NAME', 'Theapka'),
        'aba_number' => env('PAYMENT_ABA_NUMBER'),
        'bank_details' => env('PAYMENT_BANK_DETAILS'),
        // Path under public/ to a KHQR image, e.g. "images/khqr.png".
        'khqr_image' => env('PAYMENT_KHQR_IMAGE'),
        'telegram' => env('SUPPORT_TELEGRAM', 'Kimsreng5'),
    ],

];
