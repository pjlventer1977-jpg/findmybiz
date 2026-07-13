"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryCard } from "@/components/home/cards/category-card";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/data/homepage";
import type { Category } from "@/types";

const INITIAL_VISIBLE = 12;

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = categories.length > INITIAL_VISIBLE;
  const visibleCategories = showAll
    ? categories
    : categories.slice(0, INITIAL_VISIBLE);

  return (
    <section className="border-b border-slate-200 bg-white py-8 sm:py-10">
      <SectionShell>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-sa-blue sm:text-2xl">
              Browse Categories
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find trusted businesses by service type across South Africa
            </p>
          </div>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-auto"
              onClick={() => setShowAll((current) => !current)}
              aria-expanded={showAll}
            >
              {showAll ? (
                <>
                  Show less
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show all
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleCategories.map((category, index) => {
              const Icon = getCategoryIcon(category.slug, index);
              return (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={Icon}
                />
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Categories will appear here soon.
          </p>
        )}
      </SectionShell>
    </section>
  );
}
