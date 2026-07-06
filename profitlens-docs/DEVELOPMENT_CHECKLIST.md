# Development Checklist

This checklist must be completed before Sprint 1 coding starts.

## Documentation Review

- [ ] README reviewed.
- [ ] PROJECT_RULES reviewed.
- [ ] Founder notes reviewed.
- [ ] Business doc reviewed.
- [ ] PRD reviewed.
- [ ] UI doc reviewed.
- [ ] Database doc reviewed.
- [ ] Sprint plan reviewed.
- [ ] MVP Development Readiness reviewed.
- [ ] Any missing architecture document decision acknowledged.

## Scope Confirmation

- [ ] Sprint 1 scope confirmed.
- [ ] CSV upload excluded from Sprint 1.
- [ ] CSV parser excluded from Sprint 1.
- [ ] Profit calculation excluded from Sprint 1.
- [ ] Export excluded from Sprint 1.
- [ ] Download tracking excluded from Sprint 1.
- [ ] Stripe/payment excluded from Sprint 1.
- [ ] No AI features.
- [ ] No Shopify.
- [ ] No Amazon.
- [ ] No API/webhook work.
- [ ] No team/role system.

## Product Decisions

- [ ] Default MVP download is free.
- [ ] No payment gate before default download.
- [ ] Auth method confirmed as email/password.
- [ ] Landing page copy approved.
- [ ] Sprint 1 dashboard is an empty protected shell only.
- [ ] No tax advice disclaimer will be included where appropriate.

## Technical Decisions

- [ ] Next.js App Router confirmed.
- [ ] TypeScript strict mode confirmed.
- [ ] TailwindCSS confirmed.
- [ ] Supabase confirmed.
- [ ] Vercel confirmed.
- [ ] Stripe marked as later-only.
- [ ] Folder structure approved.
- [ ] Import rules approved.
- [ ] Coding standard approved.

## Supabase Preparation

- [ ] Supabase project created.
- [ ] Supabase project URL available.
- [ ] Supabase anon key available.
- [ ] Email/password auth enabled.
- [ ] Site URL configured for local development.
- [ ] Redirect URL configured if callback route is used.
- [ ] Initial users table migration reviewed.
- [ ] RLS requirement accepted.

## Environment Variables

- [ ] `.env.example` exists.
- [ ] `.env.local` will be created locally.
- [ ] `NEXT_PUBLIC_APP_URL` confirmed.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` confirmed.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` confirmed.
- [ ] No Stripe env vars required in Sprint 1.
- [ ] No storage env vars required in Sprint 1.

## Repository Setup

- [ ] Dependencies install successfully.
- [ ] `npm run dev` starts locally.
- [ ] `npm run typecheck` available.
- [ ] `npm run build` available.
- [ ] Existing tests are understood.
- [ ] No unrelated refactor planned.

## Sprint 1 Implementation Steps

- [ ] Set up Tailwind.
- [ ] Set up Supabase clients.
- [ ] Set up middleware/session handling.
- [ ] Create login route.
- [ ] Create signup route.
- [ ] Create logout action.
- [ ] Create protected dashboard route.
- [ ] Create simple landing page.
- [ ] Create initial users migration.
- [ ] Add environment docs.
- [ ] Validate build.

## Quality Gates

- [ ] TypeScript passes.
- [ ] Build passes.
- [ ] Existing tests pass.
- [ ] Login page renders.
- [ ] Signup page renders.
- [ ] Dashboard is protected.
- [ ] Logout works.
- [ ] No Sprint 2+ features introduced.

## Pre-Coding Final Approval

Before coding starts, answer:

- [ ] Are all Sprint 1 deliverables clear?
- [ ] Are all out-of-scope items rejected?
- [ ] Is the stack unchanged?
- [ ] Is Supabase ready?
- [ ] Are env vars available?
- [ ] Is the founder aligned that default MVP download is free?

If any answer is no, do not start coding.

