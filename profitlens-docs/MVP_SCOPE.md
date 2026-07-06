# MVP Scope

This document defines what belongs in the ProfitLens MVP, what is explicitly out of scope, and what may be considered later.

## IN SCOPE

### Product Scope

- Etsy-only profit report.
- Official Etsy CSV upload.
- CSV parsing.
- Sales, refunds, fees, ads, shipping, tax, and deposits.
- Profit calculation.
- Optional COGS input.
- Dashboard.
- Report preview.
- Excel export.
- PDF export.
- Free default download.
- Clear tax treatment notes.
- Warning handling for bad or incomplete CSV data.

### Sprint 1 Scope

- Next.js project foundation.
- TypeScript setup.
- Tailwind setup.
- Supabase setup.
- Email/password authentication.
- Signup.
- Login.
- Logout.
- Protected dashboard route.
- Basic layout.
- Simple landing page foundation.
- Environment variable documentation.
- Initial users table migration.
- Folder structure and coding conventions.

### Business Scope

- Validate whether Etsy sellers find the report valuable.
- Keep the default MVP free to reduce friction.
- Collect feedback before adding payment friction.
- Later paid validation is allowed only after usage validation.

## OUT OF SCOPE

These features must not be built in the MVP:

- Shopify support.
- Amazon support.
- PayPal.
- Etsy API connection.
- Real-time marketplace sync.
- Stripe payment gate before default download.
- Stripe Connect.
- Marketplace payouts.
- AI Copilot.
- API platform.
- Webhooks.
- Team collaboration.
- Roles and permissions.
- Multi-shop workspace.
- CPA portal.
- Tax filing.
- Legal or accounting advice.
- Inventory management.
- Enterprise accounting sync.

## LATER

These features may be considered only after MVP validation:

- Paid premium report.
- $19 one-time report experiment.
- Annual plan.
- Multi-shop reports.
- Improved PDF formatting.
- More Etsy CSV formats.
- Advanced warning explanations.
- Report deletion workflow.
- File retention controls.
- CPA-facing share link.
- Stripe Checkout.
- More dashboard comparisons.
- Historical report archive.

## Features That Should Not Belong To MVP

The following are especially risky for MVP and should be rejected unless explicitly re-approved:

- Payment gate before download.
- Full subscription billing.
- Shopify or Amazon support.
- AI assistant.
- Team accounts.
- Webhook system.
- API keys.
- Background workflow engine.
- Complex analytics warehouse.
- Custom charting framework.

## MVP Boundary Rule

Every MVP feature must pass this question:

> Does this help an Etsy seller upload CSV files, understand profit, and download a CPA-ready report?

If the answer is no, it belongs later.

