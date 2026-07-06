# Architecture

Project: ProfitLens  
Architecture status: Sprint 1 baseline  
Default MVP business model: free preview and free Excel / PDF download  
Payment status: Stripe is reserved for later monetization experiments and is not part of Sprint 1.

## System Overview

ProfitLens is a focused Etsy Profit Report MVP.

The product goal is:

> Etsy seller uploads official Etsy CSV files, previews profit, and downloads a CPA-ready Excel / PDF report for free by default.

The system must stay narrow:

- Etsy only.
- CSV upload only.
- No real-time Etsy API integration.
- No Shopify or Amazon.
- No AI Copilot.
- No team workspace.
- No payment gate before default download.

High-level system:

```text
User Browser
  -> Next.js App on Vercel
    -> Supabase Auth
    -> Supabase Postgres
    -> Supabase Storage or object storage in later upload sprint
    -> CSV parser and profit calculation modules in later sprints
    -> Excel / PDF export modules in later sprints
    -> Stripe only in later monetization experiment
```

Sprint 1 system:

```text
User Browser
  -> Next.js App
    -> Supabase Auth
    -> Supabase Postgres users table
    -> Protected Dashboard shell
```

Sprint 1 must not include CSV upload, parser, report calculation, export, download tracking, or Stripe.

## App Architecture

ProfitLens uses:

- Next.js App Router for routes, layouts, server rendering, and API routes when needed.
- TypeScript for strict typing.
- TailwindCSS for simple, maintainable UI styling.
- Supabase for Auth, Postgres, RLS, and later Storage.
- Vercel for hosting and environment management.
- Stripe only later for paid experiments.

Core architecture rules:

- Pages compose UI and call feature/server actions.
- UI components do not contain business logic.
- Core profit calculation does not depend on React.
- CSV parsing does not write directly to the database.
- Export modules do not recalculate profit; they use report results.
- Dashboard does not calculate money independently.
- User-owned data must be protected by Supabase RLS.

Recommended logical layers:

```text
app/
  Route entrypoints, layouts, and server route handlers.

components/
  Reusable presentational and form components.

features/
  Feature-specific actions, schemas, and types.

lib/
  Shared infrastructure and pure utilities.

server/
  Later server-only orchestration modules if feature complexity requires them.

supabase/
  Database migrations and local Supabase config.
```

## Folder Structure

Sprint 1 folder structure:

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── auth/
│       └── callback/
│           └── route.ts
│
├── components/
│   └── auth/
│
├── features/
│   └── auth/
│
└── lib/
    └── supabase/

supabase/
└── migrations/
```

Future MVP folder additions after Sprint 1:

```text
src/
├── components/
│   ├── upload/
│   ├── dashboard/
│   ├── reports/
│   └── downloads/
│
├── features/
│   ├── uploads/
│   ├── reports/
│   └── downloads/
│
├── lib/
│   ├── csv/
│   ├── profit/
│   └── export/
│
└── server/
    ├── uploads/
    ├── reports/
    └── storage/
```

Do not create broad empty folders unless a sprint actively needs them.

## Route Architecture

### Sprint 1 Routes

Sprint 1 may include only:

```text
/                 Public landing page
/login            Login
/signup           Signup
/dashboard        Protected dashboard shell
/auth/callback    Supabase auth callback if required
```

Sprint 1 route rules:

- `/dashboard` requires authenticated user.
- Logged-out users visiting `/dashboard` are redirected to `/login`.
- Logged-in users visiting `/login` or `/signup` may be redirected to `/dashboard`.
- Landing page is public.

### Later MVP Routes

Later sprints may add:

```text
/upload
/reports
/reports/[reportId]
/downloads/[reportId]
```

API routes later, only when required:

```text
/api/uploads
/api/reports/[reportId]
/api/downloads/[reportId]
```

Do not add `/billing` in the default MVP because default report download is free.

## Supabase Architecture

Supabase responsibilities:

- Authentication.
- Managed Postgres.
- Row Level Security.
- User profile table.
- Later file storage for CSV files.
- Later report and download data storage.

Supabase Sprint 1 responsibilities:

- Email/password Auth.
- `users` profile table.
- RLS for user profile access.
- Auth session handling in Next.js middleware/server clients.

Supabase later responsibilities:

- `upload_batches`
- `uploads`
- `reports`
- `report_items`
- `download_events`
- Storage bucket for uploaded CSV files.

Supabase must not be used for:

- Storing app-level password hashes.
- Real-time subscriptions in MVP.
- Team or organization permission models.
- Analytics warehouse.

Important rule:

Credentials belong to Supabase Auth. The application `users` table stores profile metadata only.

## Auth Architecture

Sprint 1 auth method:

- Email/password.
- No magic link.
- No social login.
- No team accounts.
- No roles.

Auth flow:

```text
Signup
  -> Supabase Auth creates auth user
  -> DB trigger creates public.users profile
  -> User can access dashboard after session exists

Login
  -> Supabase Auth validates credentials
  -> Middleware/session refresh preserves auth state
  -> User reaches protected dashboard

Logout
  -> Supabase Auth signs out
  -> User returns to login
```

Protected route behavior:

- Unauthenticated dashboard requests redirect to `/login`.
- Authenticated users can access `/dashboard`.

Auth implementation rules:

- Use Supabase SSR helpers for server-side session handling.
- Do not expose service role keys to the browser.
- Do not store passwords in the app database.
- Auth errors should be user-readable and not expose internals.

## Database Architecture

### Sprint 1 Database

Sprint 1 creates only:

```text
users
```

Recommended `users` fields:

```text
id uuid primary key references auth.users(id)
email text unique not null
created_at timestamptz not null
updated_at timestamptz not null
```

Do not include `password_hash` in the application `users` table when using Supabase Auth.

Sprint 1 RLS:

- Users can read their own profile.
- Users can update their own profile if profile editing exists later.

### Later MVP Database

Later MVP tables:

```text
upload_batches
uploads
reports
report_items
download_events
```

Later table responsibilities:

- `upload_batches`: groups multiple Etsy CSV files into one report-generation session.
- `uploads`: stores uploaded CSV metadata and parser warnings.
- `reports`: stores report-level calculation results.
- `report_items`: stores detailed source-backed report lines.
- `download_events`: stores free Excel / PDF download tracking.

No MVP table should support:

- subscriptions
- teams
- roles
- api_keys
- webhooks
- platform_connections
- Stripe payments

## Security Rules

Security baseline:

- Every user-owned table must include `user_id`, except the `users` table where `id` maps to `auth.users.id`.
- RLS must be enabled for user-owned tables.
- Users can only access their own uploads, reports, downloads, and profile.
- Service role keys must never be exposed to client code.
- CSV files are sensitive financial data.
- Uploaded files must have size and type limits in upload sprint.
- Production upload storage must not rely on Vercel local filesystem.
- Error messages should not expose stack traces or raw internals.
- Spreadsheet export must escape cells beginning with `=`, `+`, `-`, or `@`.
- Product must state that reports are bookkeeping preparation, not tax, legal, or accounting advice.

Sprint 1 security boundary:

- Protect `/dashboard`.
- Use Supabase Auth sessions.
- Use RLS on `users`.
- Do not build upload or report data access yet.

## Environment Variables

### Sprint 1 Required

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Later MVP Required

Later upload/storage sprint may require:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

Use service role only in server-only code when strictly required.

### Stripe Later Only

Stripe variables are not required in Sprint 1:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Do not add Stripe env vars until a paid experiment is approved.

## Deployment Architecture

Deployment target:

- Vercel hosts the Next.js app.
- Supabase hosts Auth and Postgres.
- Supabase Storage or object storage hosts CSV files in later upload sprint.

Sprint 1 deployment:

```text
Vercel
  -> Next.js app
  -> Middleware protects dashboard
  -> Supabase Auth
  -> Supabase Postgres users table
```

Later MVP deployment:

```text
Vercel
  -> Next.js app
  -> upload/report/export routes
  -> Supabase Auth
  -> Supabase Postgres
  -> Supabase Storage
```

Vercel rules:

- Production build must pass.
- Environment variables must be configured in Vercel.
- Do not store production CSV files on local filesystem.
- Server-side routes must validate authenticated ownership before returning user data.

## Sprint 1 Architecture Boundary

Sprint 1 may build:

- Next.js project foundation.
- TypeScript setup.
- TailwindCSS setup.
- Supabase setup.
- Email/password signup.
- Login.
- Logout.
- Protected dashboard route.
- Basic layout.
- Simple landing page foundation.
- Environment variable example.
- Initial `users` migration.

Sprint 1 must not build:

- CSV upload.
- CSV parser.
- Profit calculation.
- Report generation.
- Report preview using real data.
- Excel export.
- PDF export.
- Download tracking.
- Supabase Storage upload.
- Stripe.
- Billing.
- Subscriptions.
- Team accounts.
- API/webhook platform.

Sprint 1 dashboard rule:

The dashboard is an authenticated shell only. It must not show fake financial metrics as if they came from a real report.

## What Not To Build

Do not build these in Sprint 1:

- Upload page with actual file handling.
- CSV parser.
- Profit calculation engine.
- Etsy API integration.
- Report generation pipeline.
- PDF or Excel export.
- Download event tracking.
- Stripe Checkout.
- Stripe webhook.
- Subscription plans.
- Payment gate.
- Shopify.
- Amazon.
- AI Copilot.
- API keys.
- Webhooks.
- Team or role system.
- Admin panel.
- Advanced dashboard charts.
- Background job system.
- Analytics warehouse.

Do not build these in the MVP:

- Forced payment before default download.
- Real-time Etsy sync.
- CPA collaboration portal.
- Tax filing.
- Legal or accounting advice.
- Inventory management.
- Enterprise accounting sync.

Architecture rule:

> If a feature does not help an Etsy seller upload CSV files, understand profit, and download the report in the MVP, it belongs later.

