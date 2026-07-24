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
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-1 scrollbar-none"
        aria-label="Featured Professional and Enterprise businesses"
      >
        {businesses.map((business) => (
          <div
            key={business.id}
            className="w-[min(280px,82vw)] shrink-0 snap-start sm:w-[260px] lg:w-[calc((100%-2rem)/3)]"
          >
            <BusinessCard business={business} compact className="h-full" />
          </div>
        ))}
      </div>

      {businesses.length > 1 && (
        <div className="mt-1 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("previous")}
            aria-label="Show previous featured businesses"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
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
