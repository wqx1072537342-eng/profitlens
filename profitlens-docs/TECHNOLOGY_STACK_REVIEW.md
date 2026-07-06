# Technology Stack Review

Current proposed stack:

- Next.js
- TypeScript
- TailwindCSS
- Supabase
- Stripe
- Vercel

## Verdict

Keep the stack unchanged.

No stack change is necessary before Sprint 1.

Important clarification:

> Stripe remains a later monetization technology and must not be implemented in Sprint 1 or used to block the default free MVP download.

## Next.js

Use:

- App Router.
- Server Components by default.
- Server actions for auth and later form workflows where appropriate.
- API routes only when the request shape requires them, such as upload handling in later sprints.

Why it fits:

- Fast MVP development.
- Good Vercel deployment path.
- Supports server/client boundaries.
- Works well with Supabase SSR.

Risk:

- App Router complexity can lead to scattered logic.

Mitigation:

- Keep pages thin.
- Put feature logic in `features/`.
- Put shared utilities in `lib/`.

## TypeScript

Use:

- Strict mode.
- Typed Supabase schema.
- Explicit input validation.
- Typed report/calculation models in later sprints.

Why it fits:

- Financial data requires correctness.
- CSV parsing needs clear warning and result types.

Risk:

- Over-modeling before parser details are known.

Mitigation:

- Type only what Sprint 1 uses now.
- Add parser/report types in their proper sprints.

## TailwindCSS

Use:

- Basic layout and form styling.
- Calm finance SaaS visual style.
- Reusable UI classes through components when repetition appears.

Why it fits:

- Fast UI implementation.
- Low setup overhead.
- Good for a solo founder MVP.

Risk:

- Long class strings in pages.

Mitigation:

- Extract components only when repeated.
- Do not create a large design system in Sprint 1.

## Supabase

Use:

- Auth.
- Managed Postgres.
- RLS.
- Storage in later upload sprint.

Why it fits:

- Good MVP speed.
- Integrated auth and database.
- Reduces infrastructure overhead.

Sprint 1 use:

- Email/password auth.
- Users profile table.
- RLS policy.

Not Sprint 1:

- Storage upload.
- Report tables.
- Download tracking.
- Realtime.

Risk:

- Misusing app-level users table for password data.

Mitigation:

- Credentials stay in Supabase Auth.
- App `users` table stores profile metadata only.

## Stripe

Use:

- Later paid experiment only.

Do not use in Sprint 1:

- No checkout.
- No webhook.
- No subscription.
- No payment gate.

Why it remains in stack:

- The business goal includes later paid validation.
- Stripe is a reasonable future monetization provider.

Risk:

- Adding payment too early blocks usage validation.

Mitigation:

- Keep Stripe files and env vars out of Sprint 1 unless strictly documenting future setup.

## Vercel

Use:

- Primary deployment target.
- Environment variable management.
- Production build validation.

Why it fits:

- Best fit for Next.js.
- Simple launch path.

Risk:

- File upload cannot rely on Vercel local filesystem.

Mitigation:

- Sprint 2+ uploads must use Supabase Storage or object storage.
- Sprint 1 does not implement uploads.

## Stack Decision

Final decision:

- Keep Next.js.
- Keep TypeScript.
- Keep TailwindCSS.
- Keep Supabase.
- Keep Stripe as later-only.
- Keep Vercel.

No replacement is needed.

