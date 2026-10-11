import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PriceLab | Agentic Monetization Intelligence",
  description: "Connect live market evidence to adoption, churn, and unit economics to design the next pricing experiment.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
