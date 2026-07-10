import type { LandingPageConfig } from "./seo-landing-page";

export const landingPages = {
  amazonSettlementConverter: {
    canonicalPath: "/amazon-settlement-converter",
    ctaHref: "mailto:support@flowsyncdata.com?subject=Amazon%20Settlement%20Converter%20Waitlist",
    ctaLabel: "Join waitlist",
    description:
      "Convert Amazon settlement exports into accounting-ready records with mapping, validation and export workflows. Amazon support is Coming Soon.",
    h1: "Amazon settlement converter for accounting teams.",
    highlights: ["Settlement mapping planned", "Fee and refund validation planned", "QuickBooks export planned"],
    kicker: "Amazon Settlement Converter",
    status: "Coming Soon",
    title: "Amazon Settlement Converter - Coming Soon",
  },
  amazonToQuickBooks: {
    canonicalPath: "/amazon-to-quickbooks",
    ctaHref: "mailto:support@flowsyncdata.com?subject=Amazon%20to%20QuickBooks%20Waitlist",
    ctaLabel: "Join waitlist",
    description:
      "Convert Amazon settlement data into accounting-ready QuickBooks records. Amazon integration is planned and clearly marked Coming Soon.",
    h1: "Amazon to QuickBooks data automation.",
    highlights: ["Settlement CSV preparation", "Transaction categorization", "QuickBooks-ready export planning"],
    kicker: "Amazon to QuickBooks",
    status: "Coming Soon",
    title: "Amazon to QuickBooks Automation - Coming Soon",
  },
  aiFieldMapping: {
    canonicalPath: "/ai-field-mapping",
    ctaHref: "/upload",
    ctaLabel: "Start for Free",
    description:
      "Use AI-assisted field mapping to turn inconsistent commerce CSV headers into clean accounting fields for validation and export.",
    h1: "AI field mapping for marketplace CSV files.",
    highlights: ["Header normalization", "Accounting field mapping", "Validation before export"],
    kicker: "AI Field Mapping",
    status: "Available",
    title: "AI Field Mapping for Commerce CSV Data",
  },
  csvDataCleaner: {
    canonicalPath: "/csv-data-cleaner",
    ctaHref: "/upload",
    ctaLabel: "Start for Free",
    description:
      "Clean marketplace CSV data by normalizing fields, dates, money values, warnings and export-ready report structure.",
    h1: "CSV data cleaner for commerce finance workflows.",
    highlights: ["Date and money normalization", "Missing field warnings", "Export-ready summaries"],
    kicker: "CSV Data Cleaner",
    status: "Available",
    title: "CSV Data Cleaner for Marketplace Sellers",
  },
  csvToQuickBooks: {
    canonicalPath: "/csv-to-quickbooks",
    ctaHref: "/upload",
    ctaLabel: "Start for Free",
    description:
      "Prepare marketplace CSV exports for QuickBooks by cleaning, mapping and validating transaction data before accounting handoff.",
    h1: "Turn CSV exports into QuickBooks-ready records.",
    highlights: ["CSV parsing", "Transaction validation", "QuickBooks export roadmap"],
    kicker: "CSV to QuickBooks",
    status: "Available",
    title: "CSV to QuickBooks Data Preparation",
  },
  etsyCsvConverter: {
    canonicalPath: "/etsy-csv-converter",
    ctaHref: "/upload",
    ctaLabel: "Upload Etsy CSV",
    description:
      "Convert Etsy CSV exports into clean profit, fee, tax and validation reports without connecting your Etsy account.",
    h1: "Etsy CSV converter for accounting-ready reports.",
    highlights: ["Orders, fees and refunds", "Shipping labels and tax notes", "Excel report download"],
    kicker: "Etsy CSV Converter",
    status: "Available",
    title: "Etsy CSV Converter for Accounting Reports",
  },
  etsyToQuickBooks: {
    canonicalPath: "/etsy-to-quickbooks",
    ctaHref: "/upload",
    ctaLabel: "Upload Etsy CSV",
    description:
      "Clean and transform Etsy transaction data for QuickBooks using CSV parsing, field mapping, validation and export-ready reporting.",
    h1: "Etsy to QuickBooks data preparation.",
    highlights: ["Etsy CSV upload available", "Profit and fee analysis", "QuickBooks-ready workflow roadmap"],
    kicker: "Etsy to QuickBooks",
    status: "Available",
    title: "Etsy to QuickBooks Data Automation",
  },
  shopifyCsvConverter: {
    canonicalPath: "/shopify-csv-converter",
    ctaHref: "mailto:support@flowsyncdata.com?subject=Shopify%20CSV%20Converter%20Waitlist",
    ctaLabel: "Join waitlist",
    description:
      "Prepare Shopify CSV exports for accounting workflows with field mapping, cleaning and validation. Shopify support is Coming Soon.",
    h1: "Shopify CSV converter for finance teams.",
    highlights: ["Order export mapping planned", "Fee and refund validation planned", "Accounting export planning"],
    kicker: "Shopify CSV Converter",
    status: "Coming Soon",
    title: "Shopify CSV Converter - Coming Soon",
  },
  shopifyToQuickBooks: {
    canonicalPath: "/shopify-to-quickbooks",
    ctaHref: "mailto:support@flowsyncdata.com?subject=Shopify%20to%20QuickBooks%20Waitlist",
    ctaLabel: "Join waitlist",
    description:
      "Prepare Shopify orders, fees and refunds for QuickBooks. Shopify integration is planned and marked Coming Soon.",
    h1: "Shopify to QuickBooks data automation.",
    highlights: ["Shopify orders planned", "Refund and fee mapping planned", "QuickBooks export planned"],
    kicker: "Shopify to QuickBooks",
    status: "Coming Soon",
    title: "Shopify to QuickBooks Automation - Coming Soon",
  },
} satisfies Record<string, LandingPageConfig>;
