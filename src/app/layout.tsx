import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Etsy Profit Report by ProfitLens",
  description:
    "Upload Etsy CSV exports and generate a CPA-ready Etsy profit report with fees, refunds, shipping, tax, COGS, warnings, and Excel download.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
