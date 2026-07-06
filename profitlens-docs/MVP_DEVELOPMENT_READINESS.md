# MVP Development Readiness

This document locks the minimum decisions required before ProfitLens starts formal MVP development.

ProfitLens must stay focused on one outcome:

> Etsy seller uploads official Etsy CSV files, previews profit, and downloads a CPA-ready Excel / PDF report for free by default.

## Current Readiness Status

Status: Not ready for full Sprint 1 development.

Reason:

- Product direction is clear.
- MVP scope is mostly controlled.
- Core architecture decisions are not fully locked.
- Deployment and data-handling decisions are missing.

Sprint 1 can start only after all P0 decisions in this file are confirmed.

## P0 Decisions Required Before Sprint 1

### 1. Authentication

Decision:

- MVP will use email/password authentication.
- User can sign up, log in, log out, and return later.
- Magic link is not included in MVP.
- Social login is not included in MVP.

Why:

- Email/password is simple to understand.
- It supports returning users.
- It avoids extra email-delivery complexity in the first implementation.

Sprint 1 requirement:

- Protected dashboard route.
- User session persistence.
- Basic auth error handling.

### 2. User Flow

Decision:

The MVP user flow is:

1. User visits landing page.
2. User uploads Etsy CSV files or starts from sample report.
3. System validates and parses files.
4. User sees free report preview.
5. User creates account or logs in before saving/downloading.
6. User downloads Excel / PDF report for free by default.

Important rule:

- Preview is free.
- Final download is free by default.
- Login may be required before saving or downloading so the report belongs to a user.

Why:

- Free preview reduces friction.
- Login before download allows report ownership and later access.
- Free download reduces friction for early usage validation.

### 3. Download And Monetization Model

Decision:

- MVP report download is free by default.
- No payment is required for default Excel / PDF download.
- No subscription in MVP.
- No multi-shop plan in MVP.
- No annual plan in MVP.
- No payment gate in MVP unless the founder explicitly changes this strategy.

Download object:

- Use `download_events` for basic download tracking.
- Do not use `subscriptions` for MVP.
- Do not require `orders` or `report_purchases` for the default free MVP download flow.

Report statuses:

- draft
- generating
- ready
- failed

Why:

- The first goal is to validate whether Etsy sellers find the report useful enough to download.
- Payment friction can reduce early feedback.
- Monetization can be tested later with a premium report, manual offer, or $19 paid experiment.

### 4. Database Provider

Decision:

- MVP should use a managed Postgres database.
- Database schema must stay small.
- No analytics warehouse.
- No event-sourcing.
- No multi-tenant organization model.

Recommended MVP tables:

- users
- upload_batches
- uploads
- reports
- report_items
- download_events

Do not build:

- teams
- roles
- api_keys
- webhooks
- platform_connections
- subscriptions

### 5. Upload Batch Model

Decision:

- One upload session creates one `upload_batch`.
- One `upload_batch` can contain multiple uploaded CSV files.
- One `upload_batch` generates one report.

Why:

- Etsy financial exports are often split across multiple CSV files.
- The system needs a stable way to group files into one report.

Minimum fields:

- id
- user_id
- status
- reporting_year
- created_at
- updated_at

Batch statuses:

- draft
- uploaded
- parsed
- warning
- failed

### 6. CSV File Storage

Decision:

- Local development can use local temporary storage.
- Production should use object storage.
- Original uploaded CSV files should have a retention policy.

MVP retention rule:

- Keep uploaded CSV files for 30 days by default.
- Keep parsed report data unless user deletes the report.
- User deletion should remove report access and associated uploaded file references.

File limits:

- Only `.csv` files are accepted.
- Maximum 10 files per upload batch.
- Maximum 10 MB per file for MVP.
- Larger files should return a clear error.

Why:

- Etsy CSV files contain sensitive financial data.
- Retention rules are needed before accepting real user files.

### 7. CSV Parser Scope

Decision:

MVP supports Etsy CSV files related to:

- orders
- refunds
- fees
- ads
- offsite ads
- shipping labels
- sales tax / VAT / GST
- deposits

Parser behavior:

- Unknown files should return a warning.
- Missing columns should return a warning.
- Bad dates should return a warning.
- Empty amounts should return a warning.
- Missing currency should return a warning.
- Parser should not crash the user flow.

Important rule:

- Parser must preserve source references for report explainability.

### 8. Profit Calculation Rules

Decision:

- Sales revenue is positive.
- Refunds reduce profit.
- Seller fees reduce profit.
- Ads reduce profit.
- Shipping label costs reduce profit.
- Fee credits increase profit.
- Sales Tax / VAT / GST collected by marketplace is shown but excluded from profit.
- COGS is optional.
- Net profit before COGS must always be shown.
- Net profit after COGS is shown when COGS is provided.

Important rule:

- UI must not re-calculate core profit independently.
- Dashboard and exports must use report calculation results.

### 9. Export Rules

Decision:

MVP export includes:

- Excel-compatible spreadsheet.
- Simple PDF report.

Export content:

- Annual summary.
- Monthly profit table.
- Fee breakdown.
- Tax treatment notes.
- COGS status.
- Warning list.
- Source notes.

Security rule:

- Spreadsheet export must protect against formula injection by escaping cells beginning with `=`, `+`, `-`, or `@`.

### 10. Security Rules

Decision:

MVP must include basic financial-data protection.

Minimum rules:

- Every upload belongs to one user.
- Every report belongs to one user.
- Every download event belongs to one user and one report.
- A user can only access their own uploads, reports, and downloads.
- Download requires a generated and ready report.
- Server errors should not expose raw internals to the user.
- CSV parsing should sanitize unsafe output.
- Product must clearly state: this is not tax, legal, or accounting advice.

### 11. Deployment Stack

Decision:

Recommended MVP deployment:

- App hosting: Vercel.
- Database: managed Postgres.
- File storage: object storage.
- Payments: not required for the default free-download MVP.

Required environment variables:

- Database connection.
- Auth secret.
- File storage credentials.
- App base URL.

Deployment checklist:

- Production build passes.
- Environment variables configured.
- Database migrations applied.
- File upload works in production.
- Report export works in production.
- Free Excel / PDF download works in production.
- Error pages are not raw framework errors.

## P1 Decisions Before Sprint 2

These are not required before Sprint 1, but must be resolved before upload/parser development.

- Exact Etsy CSV required columns.
- Exact warning codes.
- Report calculation versioning.
- Upload retry behavior.
- User delete-report behavior.
- Sample CSV dataset for QA.

## Sprint 1 Start Checklist

Sprint 1 can start only when every item below is checked:

- [ ] Auth method confirmed.
- [ ] Database provider confirmed.
- [ ] Free download model confirmed.
- [ ] Upload batch model confirmed.
- [ ] File storage strategy confirmed.
- [ ] Data retention rule confirmed.
- [ ] Deployment stack confirmed.
- [ ] User flow confirmed.
- [ ] Sprint 1 acceptance criteria confirmed.

## Sprint 1 Scope

Sprint 1 should include only:

- Project setup.
- Basic layout.
- Auth.
- Protected dashboard route.
- Initial database schema.
- Local development environment.

Sprint 1 should not include:

- CSV parser.
- Payment integration.
- PDF generation.
- Advanced dashboard.
- Multi-shop support.
- Subscription plans.
- AI features.
- API or webhook work.

## Final Readiness Verdict

Current status:

> Not ready for full development until P0 decisions are accepted.

After this document is accepted:

> Sprint 1 may start with a narrow setup and authentication scope.
