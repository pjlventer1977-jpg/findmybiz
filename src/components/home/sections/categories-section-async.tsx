import { Suspense } from "react";
import { getCategories } from "@/lib/queries/public";
import { CategoriesSection } from "@/components/home/sections/categories-section";
import { CategoryGridSkeleton } from "@/components/home/skeletons";
import { SectionShell } from "@/components/home/section-shell";

async function CategoriesContent() {
  const categories = await getCategories();
  return <CategoriesSection categories={categories} />;
}

function CategoriesFallback() {
  return (
    <section className="border-b border-slate-200 bg-white py-8 sm:py-10">
      <SectionShell>
        <div className="mb-5 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <CategoryGridSkeleton />
      </SectionShell>
    </section>
  );
}

export function CategoriesSectionAsync() {
  return (
    <Suspense fallback={<CategoriesFallback />}>
      <CategoriesContent />
    </Suspense>
  );
}
