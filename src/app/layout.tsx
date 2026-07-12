import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Find My Biz — South Africa Business Directory",
    template: "%s | Find My Biz",
  },
  description:
    "Find trusted businesses across South Africa. Search, request quotes, discover events and local specials. Get found. Get verified. Get leads.",
  keywords: [
    "business directory",
    "South Africa",
    "find businesses",
    "get quotes",
    "local businesses",
    "SME",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://findmybiz.co.za"
  ),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Find My Biz",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
