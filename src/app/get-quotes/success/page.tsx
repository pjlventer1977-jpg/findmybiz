import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default async function QuoteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ leads?: string }>;
}) {
  const params = await searchParams;
  const leadsRouted = params.leads ?? "0";

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Quote Request Submitted!</h1>
      <p className="text-muted-foreground mb-6">
        Your request has been sent to {leadsRouted} verified business
        {leadsRouted !== "1" ? "es" : ""} in your area. They will contact you shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/search">Browse More Businesses</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
