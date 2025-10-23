import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import ClientLayout from "./client-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { SkipLink } from "@/lib/utils/focustrap";
import { WebVitalsTracker } from "@/components/performance/WebVitalsTracker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: "Leave Management System - Streamline Employee Time Off Requests",
  description:
    "Comprehensive leave management system for tracking employee time off, approvals, and team scheduling. Features real-time notifications, calendar visibility, and role-based access control.",
  keywords: [
    "leave management",
    "employee portal",
    "time off tracking",
    "vacation requests",
    "HR software",
    "team scheduling",
    "absence management",
    "leave approval workflow",
  ],
  authors: [{ name: "Leave Management System" }],
  creator: "Leave Management System",
  publisher: "Leave Management System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://your-domain.com"),
  alternates: {
    canonical: new URL("https://your-domain.com"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "Leave Management System",
    title: "Leave Management System",
    description:
      "Streamline your leave management process with our comprehensive employee portal. Submit requests, track approvals, and view team schedules.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Leave Management System Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leave Management System",
    description: "Comprehensive leave management for modern teams",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <WebVitalsTracker />
        <ErrorBoundary>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
