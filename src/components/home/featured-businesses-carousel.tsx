"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessCard } from "@/components/business/business-card";
import { Button } from "@/components/ui/button";
import type { Business } from "@/types";

export function FeaturedBusinessesCarousel({ businesses }: { businesses: Business[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "previous" | "next") {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: (direction === "next" ? 1 : -1) * carousel.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 pr-1 scrollbar-none"
        aria-label="Featured Professional and Enterprise businesses"
      >
        {businesses.map((business) => (
          <div
            key={business.id}
            className="w-[min(295px,84vw)] shrink-0 snap-start sm:w-[280px] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <BusinessCard
              business={business}
              compact
              variant="featured"
              className="h-full"
            />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent"
        aria-hidden
      />

      {businesses.length > 1 && (
        <div className="mt-1 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-sa-gold/60 bg-white shadow-sm hover:border-sa-gold hover:bg-sa-gold/10"
            onClick={() => scroll("previous")}
            aria-label="Show previous featured businesses"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-sa-gold/60 bg-white shadow-sm hover:border-sa-gold hover:bg-sa-gold/10"
            onClick={() => scroll("next")}
            aria-label="Show next featured businesses"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
