import { Suspense } from "react";
import { SearchPageContent } from "./search-content";

export const metadata = {
  title: "Search Businesses",
  description: "Search for verified businesses across South Africa by name, category, or location.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string; city?: string; category?: string }>;
}) {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchPageWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string; city?: string; category?: string }>;
}) {
  const params = await searchParams;
  return <SearchPageContent params={params} />;
}
