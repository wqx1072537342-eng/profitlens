# Project Rules

These rules protect the ProfitLens MVP from scope creep. Every future product, design, and development task should follow this file.

## Project Principles

- Build a simple Etsy profit reporting product.
- Optimize for launch speed, user validation, and later paid validation.
- Make the product useful for small Etsy sellers and CPA handoff.
- Keep all decisions understandable for a solo founder.
- Use boring, maintainable technical choices.

## MVP Boundary

The MVP includes:

- User authentication.
- Etsy CSV upload.
- CSV parsing.
- Profit calculation.
- Dashboard.
- Excel / PDF export.
- Free Excel / PDF download by default.

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
