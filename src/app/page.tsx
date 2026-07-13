import { HeroSectionAsync } from "@/components/home/sections/hero-section-async";
import { CategoriesSectionAsync } from "@/components/home/sections/categories-section-async";
import { TrustBenefitsStrip } from "@/components/home/sections/trust-benefits-strip";
import { FeaturedQuotesSectionAsync } from "@/components/home/sections/featured-quotes-section-async";
import { SpecialsEventsSectionAsync } from "@/components/home/sections/specials-events-section-async";
import { StatsBarSectionAsync } from "@/components/home/sections/stats-bar-section-async";
import { ProvincesSection } from "@/components/home/sections/provinces-section";
import { TestimonialsSection } from "@/components/home/sections/testimonials-section";
import { BusinessOwnersSection } from "@/components/home/sections/business-owners-section";
import { RegisterCtaSection } from "@/components/home/sections/register-cta-section";
import { NewsletterBar } from "@/components/home/sections/newsletter-bar";

export default function HomePage() {
  return (
    <>
      <HeroSectionAsync />
      <CategoriesSectionAsync />
      <TrustBenefitsStrip />
      <FeaturedQuotesSectionAsync />
      <SpecialsEventsSectionAsync />
      <StatsBarSectionAsync />
      <ProvincesSection />
      <TestimonialsSection />
      <BusinessOwnersSection />
      <RegisterCtaSection />
      <NewsletterBar />
    </>
  );
}
