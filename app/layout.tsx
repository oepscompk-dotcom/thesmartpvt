import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import DynamicFavicon from "@/components/DynamicFavicon";

export const metadata: Metadata = {
  title: "THE SMART ERP | Multi-Franchise Telecom Distribution Platform",
  description:
    "Enterprise SaaS platform for telecom distribution management. SIM Distribution, Device Management, Workforce Management, Inventory, Payroll & Accounting.",
  keywords: [
    "ERP",
    "telecom",
    "distribution",
    "franchise",
    "SIM management",
    "workforce",
    "payroll",
    "inventory",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <DynamicFavicon />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
