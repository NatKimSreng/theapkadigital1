# Theapka — Wedding & Event Planner

A Khmer/English wedding and event planning dashboard (inspired by PlanEssential), built with **Laravel 13**, **Inertia.js**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **Recharts**.

## Features

- **Events** — create multiple events (wedding, engagement, birthday, …) with date, venue, budget and a custom USD↔KHR exchange rate.
- **Dashboard** (ផ្ទាំងព័ត៌មាន) — guests invited, confirmed attendees, total gifts (USD + riel), expenses vs budget, profit/loss, and charts for attendance, finances and expenses by category.
- **Guest list** (បញ្ជីភ្ញៀវ) — sides, groups, party size, RSVP status with quick inline updates, search & filters.
- **Gifts** (ចំណងដៃ) — record cash gifts in USD and/or KHR, payment method (Cash, ABA, ACLEDA, Wing), linked to guests.
- **Expenses** (ចំណាយ) — estimated vs actual cost per category, paid/unpaid toggle, remaining budget.
- **Checklist** (ការរៀបចំ) — preparation tasks with due dates and progress.
- Khmer / English language switcher, light/dark mode, 2FA & passkeys (from the Laravel starter kit).

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed   # creates test@example.com / password with a demo event
composer run dev             # or: php artisan serve + npm run dev
```

Run the tests with `php artisan test`.
