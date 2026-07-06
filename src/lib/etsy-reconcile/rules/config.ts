export const ETSY_REQUIRED_FIELDS = {
  orders: [
    "Sale Date",
    "Order ID",
    "Buyer",
    "Item Name",
    "Quantity",
    "Currency",
    "Item Price",
    "Shipping",
    "Discount",
    "Sales Tax",
    "Order Total",
    "Payment Type",
    "Status",
  ],
  refunds: ["Date", "Order ID", "Type", "Amount", "Currency", "Reason"],
  fees: ["Date", "Order ID", "Fee Type", "Amount", "Currency"],
  ads: ["Date", "Campaign", "Listing", "Clicks", "Orders", "Ad Cost", "Currency"],
  offsiteAds: ["Date", "Order ID", "Ad Type", "Fee", "Currency"],
  shippingLabels: [
    "Purchase Date",
    "Order ID",
    "Carrier",
    "Tracking",
    "Shipping Cost",
    "Currency",
  ],
  salesTax: ["Date", "Order ID", "Sales Tax", "Currency"],
  deposits: [
    "Deposit Date",
    "Deposit ID",
    "Gross Sales",
    "Refunds",
    "Fees",
    "Deposit Amount",
    "Currency",
  ],
  reserves: ["Date", "Type", "Order ID", "Amount", "Currency", "Release Date", "Reason"],
  chargebacks: ["Date", "Type", "Order ID", "Amount", "Currency", "Reason"],
  multiCurrency: [
    "Date",
    "Type",
    "Order ID",
    "Original Amount",
    "Original Currency",
    "Reporting Amount",
    "Reporting Currency",
    "FX Rate",
  ],
  taxes: ["Date", "Type", "Order ID", "Amount", "Currency"],
  feeAdjustments: ["Date", "Order ID", "Adjustment Type", "Amount", "Currency", "Reason"],
  paymentAdjustments: [
    "Sale Date",
    "Order ID",
    "Item Name",
    "Quantity",
    "Currency",
    "Item Price",
    "Shipping",
    "Seller Funded Discount",
    "Etsy Funded Coupon",
    "Payment Type",
    "Status",
  ],
  cogs: [
    "SKU",
    "Item Name",
    "Unit COGS",
    "Packaging Cost",
    "External Fulfillment Cost",
    "Currency",
  ],
  bankStatements: [
    "Bank Date",
    "Bank Transaction ID",
    "Deposit ID",
    "Amount",
    "Currency",
    "Memo",
  ],
} as const;

export const ETSY_KNOWN_FEE_TYPES = [
  "Transaction Fee",
  "Payment Processing Fee",
  "Listing Fee",
  "Shipping Label",
  "Regulatory Operating Fee",
  "Pattern Fee",
  "Subscription Fee",
] as const;

export const ETSY_CHARGEBACK_TYPES = {
  principal: "Chargeback Principal",
  fee: "Chargeback Fee",
  reversal: "Chargeback Reversal",
  caseRefund: "Etsy Case Refund",
} as const;

export const ETSY_RESERVE_TYPES = {
  held: "reserveHeld",
  released: "reserveReleased",
} as const;

export const ETSY_TAX_TYPES = {
  salesTax: "Sales Tax",
  vat: "VAT",
  gst: "GST",
  marketplaceCollectedTax: "Marketplace Collected Tax",
  taxOnSellerFees: "Tax on Seller Fees",
} as const;

export const ETSY_FEE_ADJUSTMENT_TYPES = {
  transactionFeeCredit: "Transaction Fee Credit",
  processingFeeCredit: "Processing Fee Credit",
  listingFeeCredit: "Listing Fee Credit",
  shippingLabelRefund: "Shipping Label Refund",
  regulatoryFeeAdjustment: "Regulatory Fee Adjustment",
} as const;

export const DEFAULT_RECONCILIATION_TOLERANCE = 0.01;

