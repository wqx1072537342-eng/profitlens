# UI Requirements

## Design Style

ProfitLens should feel clear, practical, and trustworthy. The UI is for sellers dealing with money and taxes, so it should avoid flashy or overly playful design.

Style direction:

- Clean SaaS interface.
- Calm finance dashboard.
- High readability.
- Clear tables and summaries.
- Simple status messages.
- Strong upload and preview flow.
- Minimal decoration.
- Professional SaaS structure.
- Stripe / Linear / Vercel / Notion level clarity, without copying their visual identity.
- Dense enough for repeated work, but still friendly for first-time Etsy sellers.

## Page List

P0 pages:

- Landing Page.
- Login / Signup.
- Dashboard.
- Upload Page.
- Report Page.
- Download Page.

Approved SaaS upgrade pages:

- Pricing.
- Billing.
- Account.
- Settings.
- Feedback.
- Onboarding.
- Reports history.

Coming Soon surfaces:

- AI Insights.
- Shopify.
- Amazon.

## Landing Page

Purpose:

- Explain the pain.
- Explain the promise.
- Get the user to upload or sign up.

Required content:

- Headline: "Upload Etsy CSV, get a CPA-ready profit report."
- Explanation that no Etsy account connection is needed for MVP.
- Free preview.
- Free Excel / PDF download by default.
- Simple product flow: Upload -> Review -> Dashboard -> Download.
- FAQ about tax advice, data storage, supported CSV files, and COGS.

## Login / Signup

Purpose:

- Let users save uploads and reports.
- Keep the flow simple.

Required elements:

- Email field.
- Password or magic-link flow.
- Signup action.
- Login action.
- Clear error states.

## Dashboard

Purpose:

- Show the seller the financial result quickly and tell them what action to take next.

Required sections:

- Total revenue.
- Refunds.
- Etsy fees.
- Ads.
- Shipping.
- Tax excluded from profit.
- Net profit before COGS.
- Net profit after COGS.
- Warnings.
- Reports generated.
- Downloads.
- Recent reports.
- Data completeness status.
- Next best action.

Next best action rules:

- No reports: Upload Etsy CSV.
- Limited report: Upload missing CSV files.
- Warnings exist: Review warnings.
- Complete report exists: Download Excel report.
- Downloads exist: View report history.

## Upload Page

Purpose:

- Let user upload Etsy official CSV files.
- Let user build one report batch over multiple upload rounds.

Required elements:

- Multi-file upload.
- Supported CSV explanation.
- File recognition result.
- Missing field warnings.
- Continue button after validation.
- Report Batch Workspace.
- Uploaded file list.
- Missing file checklist.
- Complete / Partial / Limited status.
- Generate Preview even when files are incomplete.

## Report Page

Purpose:

- Provide a CPA-ready preview before export.

Required sections:

- Annual summary.
- Monthly profit table.
- Fee breakdown.
- Tax treatment note.
- COGS note.
- Export preview.
- Warning list.

## Download Page

Purpose:

- Let users export the report after preview.

Required elements:

- Product name.
- What is included.
- Excel download action.
- PDF download action.
- Clear note that the default MVP download is free.
- Optional future pricing message only if monetization is being tested.

## Pricing Page

Purpose:

- Explain future pricing without blocking the free MVP flow.
- Test whether users understand and accept the value proposition.

Required sections:

- Headline: "Simple pricing. Start free."
- Free Beta plan.
- One-Time Report Coming Soon.
- Pro Coming Soon.
- FAQ about free download and paid beta timing.

Plan details:

- Free Beta: $0/month, Etsy CSV upload, Profit Preview, report history, Excel download.
- One-Time Report: $19/report, Coming Soon, CPA-ready annual report, Excel and PDF.
- Pro: $19/month, Coming Soon, unlimited reports and advanced insights.

## Billing Page

Purpose:

- Show current plan and usage without connecting Stripe.

Required sections:

- Current plan: Free Beta.
- Usage: reports generated, downloads, upload batches.
- Upgrade options: Coming Soon.
- CTA: Join paid beta waitlist or send feedback.

## Account Page

Purpose:

- Give users confidence that reports and account data are saved.

Required sections:

- Email.
- Display name placeholder.
- Business type: Etsy Seller.
- Recent reports.
- Recent upload batches.
- Account actions.

## Settings Page

Purpose:

- Provide basic SaaS account management without over-building.

Required sections:

- Profile.
- Notifications.
- Security.
- Account.

MVP placeholders:

- Change password: Coming Soon or link to Supabase password flow when available.
- 2FA: Coming Soon.
- Delete account: Coming Soon unless fully implemented.

## Feedback Page

Purpose:

- Collect user blockers and paid-intent signals.

Required content:

- Prompt: "Tell us what blocked you from finishing your Etsy report."
- Feedback categories.
- Contact email or mailto action.
- Optional message box when database-backed feedback is approved.

## Sidebar Navigation

Logged-in app navigation:

- Dashboard.
- Data Import.
- Reports.
- Billing.
- Account.
- Settings.
- Feedback.

Coming Soon group:

- AI Insights.
- Shopify.
- Amazon.

Navigation rules:

- Coming Soon items must be visually distinct.
- Do not route unsupported platforms into fake working screens.
- Keep primary user path obvious: Data Import -> Profit Preview -> Reports -> Download.
