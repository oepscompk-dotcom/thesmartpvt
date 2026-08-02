import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import DynamicFavicon from "@/components/DynamicFavicon";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A2647",
};

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
