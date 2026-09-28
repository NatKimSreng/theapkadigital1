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

    'payment' => [
        'account_name' => env('PAYMENT_ACCOUNT_NAME', 'Theapka'),
        'aba_number' => env('PAYMENT_ABA_NUMBER'),
        'bank_details' => env('PAYMENT_BANK_DETAILS'),
        // Path under public/ to a KHQR image, e.g. "images/khqr.png".
        'khqr_image' => env('PAYMENT_KHQR_IMAGE'),
        'telegram' => env('SUPPORT_TELEGRAM'),
    ],

];
