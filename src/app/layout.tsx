import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "Find My Biz";
const APP_DESCRIPTION =
  "Find trusted businesses across South Africa. Search, request quotes, discover events and local specials. Get found. Get verified. Get leads.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "Find My Biz — South Africa Business Directory",
    template: "%s | Find My Biz",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "business directory",
    "South Africa",
    "find businesses",
    "get quotes",
    "local businesses",
    "SME",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za"
  ),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: APP_NAME,
    title: {
      default: "Find My Biz — South Africa Business Directory",
      template: "%s | Find My Biz",
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: "Find My Biz — South Africa Business Directory",
      template: "%s | Find My Biz",
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#007A4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body className={`${inter.className} overflow-x-hidden`}>
        <AnnouncementBar />
        <Header />
        <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
