# Project Rules

These rules protect the ProfitLens MVP from scope creep. Every future product, design, and development task should follow this file.

## Project Principles

- Build a simple Etsy profit reporting product.
- Optimize for launch speed, user validation, and later paid validation.
- Make the product useful for small Etsy sellers and CPA handoff.
- Keep all decisions understandable for a solo founder.
- Use boring, maintainable technical choices.
- Approved upgrade direction: professional SaaS appearance and UX while staying Etsy-first.
- SaaS-style pages are allowed only when they support trust, activation, feedback, or paid validation.

## MVP Boundary

The MVP includes:

- User authentication.
- Etsy CSV upload.
- CSV parsing.
- Profit calculation.
- Dashboard.
- Excel / PDF export.
- Free Excel / PDF download by default.
- Professional SaaS shell and navigation.
- Pricing page for positioning and paid-interest testing.
- Billing page as a non-payment plan/usage preview.
- Account, settings, and feedback pages.
- Onboarding that guides sellers to first report value.

The MVP does not include:

- Shopify.
- Amazon.
- Stripe Connect or marketplace payouts.
- PayPal integration.
- AI Copilot.
- API access.
- Webhooks.
- Team collaboration.
- Enterprise accounting sync.
- Real-time marketplace sync.
- Forced payment before download.

The MVP may mention these as Coming Soon or waitlist items:

- Shopify.
- Amazon.
- AI insights.
- Pro plan.
- One-time paid report.

Mentioning Coming Soon items must not imply current support.

## Codex Development Rules

- Do not develop features outside the PRD without explicit approval.
- Do not add new platforms beyond Etsy.
- Do not add complex abstractions before the MVP needs them.
- Do not introduce background jobs unless required for a P0 flow.
- Do not add AI features.
- Do not add team, role, or organization systems.
- Do not replace the CSV-first model with API-first integration.
- Do not add a payment gate to the default download flow unless the founder explicitly changes the MVP pricing strategy.
- Keep code paths simple enough for a solo developer to debug.
- Do not implement real Shopify, Amazon, AI, subscription billing, or Stripe until separately approved.
- Do not let SaaS polish hide product limitations. If a feature is Coming Soon, label it clearly.
- Do not create fake financial metrics that look like they came from real user data.

## No Over-Design

Avoid:

- Multi-tenant enterprise architecture.
- Plugin systems.
- Complex permission models.
- Custom workflow engines.
- Large analytics warehouses.
- Advanced chart systems before basic profit reporting works.
- Premature automation.

## No Scope Expansion

Any proposed feature must pass this question:

> Does this help an Etsy seller upload CSV files, understand profit, and download the report within the MVP?

If the answer is no, it belongs after launch.

## Approved SaaS Upgrade Boundary

Allowed now:

- Better landing page trust and conversion copy.
- Sidebar navigation for the logged-in app.
- Dashboard cards based on real report/upload data.
- Pricing page with Free Beta, One-Time Report Coming Soon, and Pro Coming Soon.
- Billing page that shows current Free Beta plan and usage without payment collection.
- Account page with user profile, recent reports, and account actions.
- Settings page with basic profile/notification/security placeholders.
- Feedback page that helps users send product problems by email or a simple form.
- Onboarding flow that guides a new Etsy seller to upload CSV files and generate a first report.

Not allowed now:

- Real Shopify data parsing.
- Real Amazon data parsing.
- Real AI Assistant or AI recommendations.
- Stripe Checkout or subscriptions.
- Feature gating downloads behind payment.
- Team accounts, roles, API keys, or webhooks.
