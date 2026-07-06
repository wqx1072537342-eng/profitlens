# Sprint 1 Development Plan

Sprint: Sprint 1  
Theme: Project Setup and Authentication  
Goal: Establish the technical foundation and basic user account flow without implementing CSV, reporting, export, payment, or download features.

## Sprint 1 Principle

Sprint 1 must create the smallest reliable foundation for later MVP work.

It should not build business features beyond authentication and protected routing.

## Project Initialization

Tasks:

- Confirm Next.js App Router structure.
- Confirm TypeScript strict mode.
- Add TailwindCSS configuration.
- Add base app metadata.
- Add `.env.example`.
- Add Vercel configuration if needed.
- Confirm project scripts:
  - `dev`
  - `typecheck`
  - `test`
  - `build`

Deliverable:

- Project can install, run, typecheck, and build.

Estimated time:

- 0.5 day.

## Authentication

Decision:

- Use Supabase email/password authentication.
- Do not implement magic link in Sprint 1.
- Do not implement social login.

Tasks:

- Create signup page.
- Create login page.
- Create logout action.
- Create Supabase server client.
- Create Supabase browser client only if required by forms.
- Create middleware/session handling.
- Redirect authenticated users away from auth pages.
- Redirect unauthenticated users away from protected pages.

Deliverable:

- User can sign up, log in, log out, and return to protected dashboard.

Estimated time:

- 1.5 days.

## Landing Page

Scope:

- Simple public landing page foundation only.
- No upload interaction.
- No report generation.
- No pricing flow.

Required content:

- ProfitLens name.
- Headline: "Upload Etsy CSV, get a CPA-ready profit report."
- Short value proposition.
- CTA to signup/login.
- Note that default MVP download is free.

Deliverable:

- Public page explains the product and links to signup/login.

Estimated time:

- 0.5 day.

## Basic Layout

Tasks:

- Create public layout.
- Create auth layout.
- Create app layout.
- Add simple navigation.
- Add consistent typography and spacing using Tailwind.
- Add basic error/empty states.

Deliverable:

- Public, auth, and protected app surfaces feel consistent.

Estimated time:

- 0.5 day.

## Routing

Sprint 1 routes:

- `/`
- `/login`
- `/signup`
- `/dashboard`

Optional technical route:

- `/auth/callback` only if needed by Supabase.

Not in Sprint 1:

- `/upload`
- `/reports`
- `/downloads`
- `/billing`
- `/api/uploads`
- `/api/reports`

Deliverable:

- Protected and public route behavior works.

Estimated time:

- 0.5 day.

## Environment Variables

Required:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Not required in Sprint 1:

- Stripe secret key.
- Stripe webhook secret.
- File storage secret.
- Background job secrets.

Deliverable:

- `.env.example` documents required variables.

Estimated time:

- 0.25 day.

## Supabase Initialization

Tasks:

- Create Supabase client helpers.
- Create initial users migration.
- Enable RLS.
- Add user profile creation trigger if using Supabase Auth.
- Confirm no app-level password hash is stored.

Initial table:

- `users`

Fields:

- `id`
- `email`
- `created_at`
- `updated_at`

Deliverable:

- Supabase auth can create and identify user profile records.

Estimated time:

- 0.75 day.

## Folder Structure

Sprint 1 structure:

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   └── (app)/
│       └── dashboard/
├── components/
│   └── auth/
├── features/
│   └── auth/
└── lib/
    └── supabase/
```

Do not create empty business folders unless needed by active Sprint 1 code.

## Coding Standard

- TypeScript strict mode.
- Server Components by default.
- Client Components only for interactive forms.
- Server actions for auth form submissions.
- No business logic in UI components.
- No direct Supabase service role usage in client code.
- No placeholder business implementations.
- No mock auth if Supabase is required.
- Clear user-facing error messages for missing environment configuration.

## Deliverables

Sprint 1 is complete when the following exist:

- Next.js project foundation.
- Tailwind styling foundation.
- Supabase client setup.
- Auth pages.
- Auth actions.
- Protected dashboard.
- Initial users migration.
- Environment example.
- Basic route protection.
- Build/test instructions.

## Acceptance Criteria

- `/` renders.
- `/signup` renders.
- `/login` renders.
- `/dashboard` is protected.
- Unauthenticated `/dashboard` access redirects to `/login`.
- A configured Supabase project allows signup.
- User can log in.
- User can log out.
- Authenticated user can access `/dashboard`.
- Users table migration exists.
- RLS is enabled for the users table.
- No CSV upload is implemented.
- No parser work is implemented.
- No export work is implemented.
- No Stripe/payment work is implemented.
- `npm run typecheck` passes.
- `npm run build` passes.

## Risk

| Risk | Mitigation |
|---|---|
| Supabase env not configured. | Show clear setup error and document `.env.example`. |
| Auth flow depends on email confirmation setting. | Document Supabase redirect URL requirements. |
| Scope creep into upload or reports. | Reject non-Sprint 1 routes and business logic. |
| Stripe introduced too early. | Keep Stripe inactive and out of Sprint 1 code. |
| Landing page becomes a redesign project. | Build only simple copy and CTA. |

## Estimated Time

Total: 4 to 5 working days.

Suggested sequence:

1. Project initialization: 0.5 day.
2. Supabase setup: 0.75 day.
3. Auth pages and actions: 1.5 days.
4. Layout and routing: 0.75 day.
5. Landing page foundation: 0.5 day.
6. Testing and polish: 0.5 to 1 day.

