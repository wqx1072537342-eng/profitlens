# Product Requirements Document

## MVP Goal

ProfitLens MVP allows an Etsy seller to upload official Etsy CSV files, review parsed financial data, view a profit dashboard, and export an Excel / PDF report for free by default.

The MVP should be simple enough to ship in 30 days and useful enough to charge for within 90 days.

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

## Acceptance Criteria

- A new user can complete the full flow from signup to report download.
- Uploaded Etsy CSV files are parsed without crashing.
- Unsupported or incomplete CSV files return clear warnings.
- Dashboard displays core profit metrics.
- Sales Tax / VAT / GST are clearly excluded from profit.
- Excel and PDF exports can be downloaded.
- Free download is available after the report is generated.
- The product can be demonstrated end-to-end with real or representative Etsy CSV data.
