<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Support\Seo;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public showcase of the invitation designs, filled with sample content.
 */
class TemplateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('templates/index', [
            'premium' => Invitation::PREMIUM_TEMPLATES,
        ])->withViewData('seo', Seo::page(
            title: __('Invitation templates'),
            description: __('Browse Theapka\'s digital wedding and event invitation designs — each with photos, countdown, agenda, map, gallery, gift QR and RSVP.'),
            image: asset('images/demo/couple-4.webp'),
        ));
    }

    public function show(string $template): Response
    {
        abort_unless(in_array($template, Invitation::TEMPLATES, true), 404);

        $name = Str::headline($template);

        return Inertia::render('templates/show', [
            'template' => $template,
            'premium' => in_array($template, Invitation::PREMIUM_TEMPLATES, true),
        ])->withViewData('seo', Seo::page(
            title: __(':name — invitation template', ['name' => $name]),
            description: __('See the :name design with sample photos, countdown, agenda, map, gallery and RSVP, then make it yours on Theapka.', ['name' => $name]),
            image: asset('images/demo/couple-1.webp'),
            schema: [Seo::breadcrumbs([
                __('Invitation templates') => route('templates.index'),
                $name => route('templates.show', $template),
            ])],
        ));
    }
}
