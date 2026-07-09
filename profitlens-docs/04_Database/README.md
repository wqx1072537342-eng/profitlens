# Database

The MVP database should stay small. It only needs to support users, upload batches, uploads, generated reports, report line items, and basic download tracking.

## Core Tables

- users
- upload_batches
- uploads
- reports
- report_items
- download_events

Approved SaaS upgrade candidate tables:

- profiles
- feedback_messages

## users

Stores account identity synchronized from Supabase Auth.

Suggested fields:

- id: primary key.
- email: unique user email.
- created_at: account creation time.
- updated_at: last update time.

Do not store password hashes in `public.users` when using Supabase Auth.

## profiles

Stores lightweight SaaS profile and onboarding state.

Suggested fields:

- id: primary key.
- user_id: linked user.
- display_name: optional name.
- business_type: Etsy Seller, Shopify Coming Soon, Amazon Coming Soon, Other.
- onboarding_completed: boolean.
- created_at: creation time.
- updated_at: last update time.

Rules:

- This table is optional until onboarding/settings need it.
- Must have RLS.
- Users can read and update only their own profile.

## upload_batches

Groups multiple uploaded Etsy CSV files into one report-generation session.

Suggested fields:

- id: primary key.
- user_id: linked user.
- reporting_year: report year selected or detected.
- status: draft, uploaded, parsed, warning, failed.
- created_at: creation time.
- updated_at: last update time.

## uploads

Stores uploaded CSV metadata.

Suggested fields:

- id: primary key.
- user_id: linked user.
- upload_batch_id: linked upload batch.
- file_name: original file name.
- file_type: recognized Etsy CSV type.
- storage_path: file location if stored.
- row_count: parsed row count.
- status: uploaded, parsed, warning, failed.
- warnings_json: parser warnings.
- rows_json: parsed rows when raw CSV files are not stored.
- created_at: upload time.

## reports

Stores report-level calculation results.

Suggested fields:

- id: primary key.
- user_id: linked user.
- upload_batch_id: group identifier for related uploads.
- reporting_year: report year.
- currency: reporting currency.
- gross_sales: total Etsy sales.
- refunds: total refunds.
- fees: total Etsy fees.
- ads: total ads.
- shipping: total shipping income or cost summary.
- tax_collected: Sales Tax / VAT / GST shown but excluded from profit.
- cogs: optional cost of goods sold.
- net_profit_before_cogs: profit before COGS.
- net_profit_after_cogs: profit after COGS.
- status: draft, preview, ready, failed.
- completeness_status: complete, partial, limited.
- included_file_types_json: recognized CSV types included in calculation.
- missing_file_types_json: missing CSV types that may affect accuracy.
- created_at: report creation time.
- updated_at: last update time.

## report_items

Stores detailed report rows used for dashboard, exports, and source explanation.

Suggested fields:

- id: primary key.
- report_id: linked report.
- source_upload_id: source CSV upload.
- category: sales, refund, fee, ad, shipping, tax, cogs, adjustment.
- label: human-readable line item name.
- amount: normalized amount.
- currency: amount currency.
- source_reference: CSV file and row reference.
- included_in_profit: boolean.
- note: explanation for CPA or user.
- created_at: creation time.

## download_events

Stores basic free-download tracking for product learning and abuse prevention.

Suggested fields:

- id: primary key.
- user_id: linked user.
- report_id: linked report.
- export_type: excel or pdf.
- downloaded_at: download time.
- ip_hash: optional hashed IP for abuse monitoring.
- user_agent_hash: optional hashed user agent for abuse monitoring.

## feedback_messages

Stores user-reported blockers and paid-intent signals.

Suggested fields:

- id: primary key.
- user_id: linked user, nullable only if public feedback is later allowed.
- email: contact email.
- category: feedback category.
- message: user feedback.
- status: new, reviewed, resolved, ignored.
- created_at: creation time.

Rules:

- Add only when moving beyond mailto feedback.
- Must have RLS.
- Users can create feedback and read their own feedback if feedback history is shown.
- Admin/service role can review feedback later.

## Field Rules

- Amounts should be stored as decimal values, not floating point where possible.
- Each report item should preserve enough source context to explain the number.
- Tax collected by marketplace should be stored and displayed, but excluded from profit.
- Parser warnings should be saved so the user can review incomplete data.
- Default MVP report download is free and should not require a billing record.
- Avoid adding tables until a real MVP flow requires them.
- Pricing and billing preview pages do not require subscription tables yet.
- Do not create `subscriptions` until real Stripe or paid experiment implementation is approved.
- Do not create Shopify, Amazon, AI, team, API, or platform connection tables in the Etsy-first MVP.
