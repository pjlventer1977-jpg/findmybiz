import { getProvinces, getCategories } from "@/lib/queries/public";
import { QuoteRequestForm } from "./quote-form";

export const metadata = {
  title: "Get 5 Quotes",
  description: "Request up to 5 quotes from verified South African businesses in your area.",
};

export default async function GetQuotesPage() {
  const [provinces, categories] = await Promise.all([
    getProvinces(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Get 5 Quotes</h1>
        <p className="text-muted-foreground">
          Tell us what you need and we&apos;ll connect you with up to 5 verified businesses in your area.
        </p>
      </div>

      <QuoteRequestForm provinces={provinces} categories={categories} />
    </div>
  );
}
