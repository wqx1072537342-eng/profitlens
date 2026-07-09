# ProfitLens Professional SaaS Upgrade Plan

## Approved Direction

ProfitLens will continue as an Etsy-first product.

The next product direction is:

> Upgrade ProfitLens from an MVP-looking Etsy report tool into a professional SaaS website and app experience without expanding the real product scope beyond Etsy CSV Profit Reports.

This direction is approved because it supports:

- User acquisition: a more credible public website and pricing page.
- Activation: clearer onboarding and next steps.
- Retention: account, reports, and dashboard surfaces.
- Conversion learning: pricing, billing preview, and paid beta interest.
- Revenue growth: preparation for a later $19 report or Pro plan experiment.

## Product Boundary

Allowed now:

- Professional homepage improvements.
- Pricing page.
- Billing preview page.
- Account page.
- Settings page.
- Feedback page.
- Onboarding flow.
- Dashboard upgrade based on real Etsy report data.
- Sidebar navigation.
- Coming Soon labels for Shopify, Amazon, AI, and Pro features.

Not allowed now:

- Real Shopify support.
- Real Amazon support.
- Real AI Assistant.
- Real Stripe billing or subscriptions.
- Payment gates before default download.
- Teams, API keys, webhooks, or enterprise workflows.

## Information Architecture

Public:

```text
/
/pricing
/faq
/contact
/login
/signup
```

Logged-in app:

```text
/dashboard
/data-import
/upload
/reports
/reports/[reportId]
/billing
/account
/settings
/feedback
```

Coming Soon:

```text
/ai-insights
/shopify
/amazon
```

The app may keep `/upload` as the real route while using "Data Import" as the navigation label.

## Professional SaaS Requirements

### Public Website

The public website should communicate:

- Upload Etsy CSV files.
- Get a CPA-ready profit report.
- No Etsy account connection required.
- Free preview.
- Free MVP Excel download by default.
- This is bookkeeping preparation, not tax advice.

### Pricing

Plans:

- Free Beta: $0/month.
- One-Time Report: $19/report, Coming Soon.
- Pro: $19/month, Coming Soon.

Pricing page must not connect payment in the MVP.

### Billing Preview

Billing page should show:

- Current plan: Free Beta.
- Reports generated.
- Downloads.
- Upload batches.
- Upgrade options as Coming Soon.

### Account

Account page should show:

- Email.
- Business type.
- Recent reports.
- Recent upload batches.
- Account actions.

### Settings

Settings should include:

- Profile.
- Notifications.
- Security.
- Account.

Most controls may be placeholders until fully implemented.

### Feedback

Feedback page should collect:

- CSV discovery problems.
- Upload problems.
- Report calculation concerns.
- Missing categories.
- PDF/export requests.
- Paid-intent statements.

MVP can use mailto first.

## Sprint Roadmap

### Sprint 6 Professional SaaS Shell

Deliver:

- Sidebar navigation.
- Pricing page.
- Billing, Account, Settings, Feedback route shells.
- Coming Soon treatment.

### Sprint 7 Dashboard Upgrade

Deliver:

- Real-data KPI cards.
- Recent reports.
- Data completeness.
- Next best action.
- Empty states.

### Sprint 8 Account, Billing, Settings, Feedback

Deliver:

- Account details.
- Free Beta billing preview.
- Basic settings.
- Feedback collection.

### Sprint 9 Onboarding

Deliver:

- Welcome flow.
- Business type selection.
- Etsy CSV guide.
- First upload guidance.
- First report success path.

### Sprint 10 Conversion Learning

Deliver:

- Paid beta CTAs.
- Waitlist/feedback prompts.
- Pricing copy test.
- Recommendation for paid experiment.

### Sprint 11 Paid Experiment, Later Only

Deliver only after approval:

- Stripe or one-time payment.
- Paid export option.
- Pro plan activation.

## Recommended Next Step

Start with Sprint 6.

Reason:

- It improves trust and navigation.
- It does not risk breaking the core Etsy upload/report flow.
- It prepares the app for pricing, account, billing preview, and feedback.
- It avoids premature Shopify, Amazon, AI, and Stripe implementation.
