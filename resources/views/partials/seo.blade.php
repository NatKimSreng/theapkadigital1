@php
    /** @var \App\Support\Seo $seo */
    $seo = $seo ?? new \App\Support\Seo();
    $settings = \App\Models\Setting::values();
@endphp
<title>{{ $seo->fullTitle() }}</title>
<meta name="description" content="{{ $seo->metaDescription() }}">
<meta name="robots" content="{{ $seo->index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow' }}">
@if ($seo->index)
    <link rel="canonical" href="{{ $seo->canonical() }}">
@endif

<meta property="og:site_name" content="{{ \App\Support\Seo::siteName() }}">
<meta property="og:type" content="{{ $seo->type }}">
<meta property="og:title" content="{{ $seo->title ?? $seo->fullTitle() }}">
<meta property="og:description" content="{{ $seo->metaDescription() }}">
<meta property="og:url" content="{{ $seo->canonical() }}">
<meta property="og:image" content="{{ $seo->imageUrl() }}">
<meta property="og:locale" content="{{ $seo->ogLocale() }}">
@if ($seo->publishedAt)
    <meta property="article:published_time" content="{{ $seo->publishedAt }}">
@endif
@if ($seo->modifiedAt)
    <meta property="article:modified_time" content="{{ $seo->modifiedAt }}">
@endif
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#b07d2b">

@if ($settings['google_verification'])
    <meta name="google-site-verification" content="{{ $settings['google_verification'] }}">
@endif

@foreach ($seo->jsonLd() as $schema)
    <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
@endforeach

@if ($settings['ga_id'] && preg_match('/^G-[A-Z0-9]+$/', $settings['ga_id']))
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ $settings['ga_id'] }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        {{-- Page views are sent from app.tsx on every Inertia navigation. --}}
        gtag('config', '{{ $settings['ga_id'] }}', { send_page_view: false });
    </script>
@endif
