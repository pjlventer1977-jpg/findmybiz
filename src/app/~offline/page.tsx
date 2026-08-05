import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-sa-green">
        Find My Biz
      </p>
      <h1 className="mt-2 text-3xl font-bold text-sa-blue">You&apos;re offline</h1>
      <p className="mt-3 text-slate-600">
        This page isn&apos;t available without a connection. Check your network and try
        again.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-sa-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-sa-green/90"
      >
        Back to home
      </Link>
    </div>
  );
}
