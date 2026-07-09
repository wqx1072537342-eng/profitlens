# Product Requirements Document

## MVP Goal

ProfitLens MVP allows an Etsy seller to upload official Etsy CSV files, review parsed financial data, view a profit dashboard, and export an Excel / PDF report for free by default.

The MVP should be simple enough to ship in 30 days and useful enough to charge for within 90 days.

## Approved Product Direction

The founder has approved the following direction:

> Continue Etsy-first and upgrade ProfitLens into a professional SaaS website and app experience.

This direction means:

- Build a more credible SaaS landing page and logged-in workspace.
- Add professional navigation, dashboard, pricing, billing preview, account, settings, feedback, and onboarding.
- Keep real product functionality focused on Etsy CSV Profit Report.
- Treat Shopify, Amazon, AI Assistant, and paid plans as Coming Soon or waitlist items only.
- Do not add real multi-platform support, AI functionality, or Stripe billing until separately approved.

The purpose is to improve trust, activation, retention, and paid-intent learning without expanding the core product beyond Etsy.

## User Flow

1. User lands on the website.
2. User understands the promise: upload Etsy CSV, get a CPA-ready profit report.
3. User signs up or logs in.
4. User uploads Etsy CSV files.
5. System validates file type and required fields.
6. System parses sales, refunds, fees, ads, shipping, tax, and deposits.
7. System calculates profit.
8. User reviews dashboard.
9. User optionally adds COGS.
10. User previews report.
11. User downloads Excel / PDF report for free by default.

## SaaS Upgrade User Flow

1. User lands on professional homepage.
2. User understands Etsy-first value proposition.
3. User sees pricing and understands Free Beta.
4. User signs up or logs in.
5. New user completes onboarding.
6. User chooses Etsy Seller as business type.
7. User uploads Etsy CSV files.
8. System validates files and shows missing-file checklist.
9. User generates Profit Preview even if files are incomplete.
10. User views Dashboard with next best action.
11. User opens Reports history.
12. User downloads Excel report for free.
13. User can visit Billing, Account, Settings, and Feedback.
14. User can send feedback or join paid beta interest.

## P0 Features

### User Authentication

- Email/password or email magic-link style authentication.
- User can sign up.
- User can log in.
- User can log out.
- User can return later and see prior uploads/reports.

### CSV Upload

- User can upload one or multiple Etsy CSV files.
- System shows uploaded file names.
- System validates basic CSV format.
- System reports missing fields or unreadable files.

### CSV Parser

- Parser identifies supported Etsy CSV types.
- Parser extracts sales, refunds, fees, ads, shipping, tax, and deposits.
- Parser returns warnings instead of crashing when data is incomplete.
- Parser keeps original source references for report explainability.

### Profit Calculation

- Revenue is calculated from Etsy sales data.
- Refunds reduce profit.
- Seller fees reduce profit.
- Ads reduce profit.
- Shipping label costs reduce profit.
- Sales Tax / VAT / GST collected by marketplace is shown but excluded from profit.
- Optional COGS reduces operating profit when provided.

### Dashboard

- Shows revenue.
- Shows refunds.
- Shows fees.
- Shows ads.
- Shows shipping.
- Shows tax excluded from profit.
- Shows net profit before COGS.
- Shows net profit after COGS when COGS exists.
- Shows warnings and incomplete data.
- Shows next best action based on user state.
- Shows recent reports and downloads.
- Shows batch completeness: Complete, Partial, or Limited.

### Professional SaaS Shell

- Logged-in app uses consistent navigation.
- Navigation includes Dashboard, Data Import, Reports, Billing, Account, Settings, and Feedback.
- Coming Soon items may include AI Insights, Shopify, and Amazon but must be clearly marked.
- Sidebar/header must not imply unsupported platforms are active.

### Pricing

- Public `/pricing` page.
- Shows Free Beta as active plan.
- Shows One-Time Report and Pro as Coming Soon.
- Monthly/yearly toggle may be shown for future plans, but payment must not be connected.
- CTA actions should start free, join waitlist, or send feedback.

### Billing Preview

- Protected `/billing` page.
- Shows current Free Beta plan.
- Shows usage such as reports generated, downloads, and upload batches.
- Shows upgrade options as Coming Soon.
- Must not require Stripe or payment setup.

### Account

- Protected `/account` page.
- Shows email, display name placeholder, business type, and account created date when available.
- Shows recent reports and upload batches.
- Provides links to reports, downloads, settings, and logout.

### Settings

- Protected `/settings` page.
- Includes profile, notifications, and security sections.
- Email can be read-only for MVP.
- Change password and 2FA can be Coming Soon.

### Feedback

- Protected `/feedback` page.
- Helps users report issues or request features.
- Feedback categories:
  - Cannot find the right Etsy CSV.
  - File upload problem.
  - Report numbers look wrong.
  - Missing fee/refund/tax category.
  - Want PDF export.
  - Would pay for this if...
  - Other.
- MVP can use a mailto link first.
- Later can store feedback in `feedback_messages`.

### Export

- User can export Excel report.
- User can export PDF report.
- Export includes source notes.
- Export includes tax treatment notes.
- Export includes COGS status.

### Free Download

- User can preview report for free.
- User can download Excel / PDF report for free by default.
- No payment is required for the default MVP download flow.
- Future billing experiments must not block the default free MVP flow unless the founder explicitly changes the pricing strategy.

## Out of Scope

- Shopify.
- Amazon.
- PayPal.
- AI Copilot.
- API access.
- Webhooks.
- Team accounts.
- Real-time Etsy API sync.
- Tax filing.
- Legal or tax advice.
- CPA collaboration portal.
- Real AI Assistant.
- Real billing/subscription collection.
- Stripe Checkout.
- Paid feature gates.

## Coming Soon Scope

The product may show these items as Coming Soon or waitlist features:

- Shopify.
- Amazon.
- AI Insights.
- Pro plan.
- One-Time Report.
- Advanced product-level profit.

These must not be implemented as real functionality until separately approved.

## Acceptance Criteria

- A new user can complete the full flow from signup to report download.
- Uploaded Etsy CSV files are parsed without crashing.
- Unsupported or incomplete CSV files return clear warnings.
- Dashboard displays core profit metrics.
- Sales Tax / VAT / GST are clearly excluded from profit.
- Excel and PDF exports can be downloaded.
- Free download is available after the report is generated.
- The product can be demonstrated end-to-end with real or representative Etsy CSV data.
- Pricing page clearly communicates Free Beta and future paid options.
- Billing page shows Free Beta and usage without requiring payment.
- Feedback page makes it easy for users to contact support or describe blockers.
- Account and Settings pages make the app feel trustworthy without adding unnecessary complexity.


# Product Development Principles

Before creating any new page or feature, the team must clearly define:

1. User Problem
   - What specific user problem does this solve?

2. Business Impact
   - Which business metric will this improve?
   - Examples:
     - User acquisition
     - Activation rate
     - Retention rate
     - Conversion rate
     - Revenue

3. User Value
   - What tangible value does this deliver to users?

4. Strategic Timing
   - Why is this the right time to build this feature?


## Feature Development Rule

Do not build features simply to increase the number of functions.

Every feature must have a clear purpose, measurable value, and business impact.


## Product Growth Framework

All product decisions should support the SaaS growth funnel:

User Acquisition
        ↓
User Activation
        ↓
User Retention
        ↓
User Conversion
        ↓
Revenue Growth
