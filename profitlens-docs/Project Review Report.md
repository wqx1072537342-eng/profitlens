# Project Review Report

Role: Technical Lead and Software Architect  
Project: ProfitLens  
Review scope: README, PROJECT_RULES, Founder, Business, PRD, UI, Database, Sprint, and MVP Development Readiness.

## Executive Summary

ProfitLens has a clear MVP direction:

> Etsy seller uploads official Etsy CSV files, sees profit clarity, and downloads a CPA-ready Excel / PDF report for free by default.

The product scope is mostly well controlled. The strongest decisions are Etsy-only, CSV-first, free default download, no marketplace API integration, no AI Copilot, and no payment gate in the default MVP.

However, the documentation is not fully development-ready yet. Sprint 1 can be prepared, but a few requirement gaps and conflicts should be resolved before coding begins.

## Overall Readiness

Status: Prepare Sprint 1, but do not start broad MVP feature development yet.

Sprint 1 may proceed only if it stays limited to:

- Project initialization.
- Authentication.
- Basic layout.
- Landing page foundation.
- Routing.
- Environment configuration.
- Supabase initialization.
- Initial user schema.

CSV upload, parser, calculation, export, download tracking, and Stripe must remain outside Sprint 1.

## Missing Requirements

| Area | Missing Requirement | Impact | Recommendation |
|---|---|---|---|
| Architecture | No dedicated architecture document exists. MVP Development Readiness contains architecture decisions, but there is no standalone architecture source of truth. | Future development may rely on scattered decisions. | Add an architecture document before Sprint 2, or formally treat MVP Development Readiness as the architecture baseline for Sprint 1. |
| Authentication | PRD says email/password or magic link, while readiness chooses email/password. | Developers may implement both or choose inconsistently. | Sprint 1 must use email/password only. Magic link is out of scope. |
| Landing Page | Sprint 1 plan does not explicitly include landing page, but this request requires it. | Sprint 1 scope could be interpreted differently. | Sprint 1 landing page should be a simple public page with positioning and CTA only. No upload logic. |
| Supabase Auth | Database doc lists `password_hash` under `users`. With Supabase Auth, password hashes should stay in Supabase Auth tables, not app profile tables. | Security risk and schema confusion. | App `users` table should store profile metadata only: `id`, `email`, `created_at`, `updated_at`. |
| Environment | Required environment variables are documented generally, but no exact `.env` names are specified in docs. | Setup friction and inconsistent naming. | Define exact env names before coding: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`. |
| Acceptance Criteria | Sprint 1 acceptance criteria are too high level. | Developers may complete setup without verifying auth flows. | Add concrete Sprint 1 acceptance criteria: signup, login, logout, protected route redirect, Supabase env failure message. |
| Security | RLS is implied but not explicitly stated in Database doc. | User data isolation could be missed. | Add RLS requirement for every user-owned table. |
| Testing | No Sprint 1 testing plan exists. | Auth and routing could regress silently. | Require typecheck, build, auth route smoke test, and migration review. |

## Requirement Conflicts

| Conflict | Documents | Resolution |
|---|---|---|
| Auth method is ambiguous. | PRD says email/password or magic link; readiness says email/password. | Use email/password only for Sprint 1. |
| Stripe exists in stack but payment is out of MVP default flow. | Stack mentions Stripe; PROJECT_RULES forbids payment gate. | Keep Stripe as later monetization technology only. Do not implement Stripe in Sprint 1. |
| Business mentions later paid experiments, while MVP default is free. | Business and PRD. | Default MVP download remains free. Paid experiments are later and must not block free download. |
| Database `users.password_hash` conflicts with Supabase Auth. | Database doc vs Supabase architecture. | Remove `password_hash` from app-level users table implementation. |
| Dashboard page in UI includes profit metrics, but Sprint 1 has no parser/calculation. | UI vs Sprint 1. | Sprint 1 dashboard is only a protected empty state. Real metrics start after parser/report work. |

## Over-Engineering Review

The docs correctly avoid most over-engineering:

- No Shopify.
- No Amazon.
- No API platform.
- No webhooks.
- No teams.
- No roles.
- No AI Copilot.
- No marketplace sync.
- No payment gate.

Potential over-engineering risks:

- Stripe in the stack may tempt early payment implementation.
- Dashboard could be overbuilt before parser data exists.
- Database could expand too early beyond user/auth needs in Sprint 1.
- PDF/Excel export should not be touched before Sprint 4/5.

Recommendation:

Sprint 1 should not create upload, report, export, download, or Stripe modules beyond folder placeholders if absolutely needed. Prefer no placeholders unless required by routing or project organization.

## Missing User Flow

The complete MVP flow is documented, but Sprint 1 flow needs its own narrow definition.

Sprint 1 user flow should be:

1. Visitor lands on public landing page.
2. Visitor clicks login or signup.
3. User creates account.
4. User logs in.
5. Authenticated user reaches protected dashboard.
6. User logs out.
7. Logged-out user cannot access dashboard.

No CSV upload, report generation, or download flow should exist in Sprint 1.

## Missing Database Fields

For Sprint 1, only user profile fields are needed:

- `id`
- `email`
- `created_at`
- `updated_at`

Fields to avoid in Sprint 1:

- `password_hash`
- upload metadata
- report totals
- download event metadata
- billing state

For later sprints, Database doc should eventually add:

- `updated_at` to all mutable user-owned tables.
- `deleted_at` if soft deletion is required.
- `calculation_version` on reports.
- `warning_count` or warning summary on reports.
- `source_row_number` or structured source metadata on report items.
- Explicit enum values for statuses.

## Missing Acceptance Criteria

Sprint 1 should be accepted only when:

- Project runs locally.
- Landing page renders.
- Login page renders.
- Signup page renders.
- Supabase environment variables are documented.
- User can sign up using Supabase Auth.
- User can log in.
- User can log out.
- Dashboard is protected.
- Logged-out dashboard access redirects to login.
- Initial users table migration exists.
- No CSV upload, parser, export, payment, or download tracking is implemented.
- TypeScript check passes.
- Production build passes.

## Risk Review

| Risk | Severity | Mitigation |
|---|---|---|
| Implementing features beyond Sprint 1. | High | Enforce Sprint 1 scope and no feature expansion. |
| Building payment too early. | High | Stripe must remain inactive in Sprint 1. |
| Supabase Auth schema confusion. | Medium | Use Supabase Auth for credentials; app table stores profile only. |
| Landing page becoming a redesign project. | Medium | Build only simple MVP positioning and CTA. |
| Dashboard becoming analytics before data exists. | Medium | Use protected empty state only. |
| Missing environment setup. | Medium | Require `.env.example` and setup instructions before coding. |

## Final Review Verdict

The project is directionally ready for Sprint 1 preparation.

It is not ready for full MVP implementation until Sprint 1 has established the foundation and Sprint 2 details for CSV upload are confirmed.

