import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Reclaim.AI — Autonomous Multi-Channel Revenue Recovery",
  description: "Detect revenue at risk across payments, carts, subscriptions & invoices and win it back with bounded AI agents.",
  keywords: ["revenue recovery", "payment failures", "AI", "financial", "hinglish voice", "promise to pay"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
