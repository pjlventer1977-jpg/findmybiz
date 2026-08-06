"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryTreeSelect } from "@/components/categories/category-tree-select";
import type { Province, Category } from "@/types";

interface SearchFiltersProps {
  provinces: Province[];
  categories: Category[];
  currentParams: {
    q?: string;
    province?: string;
    city?: string;
    category?: string;
  };
}

export function SearchFilters({
  provinces,
  categories,
  currentParams,
}: SearchFiltersProps) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState(currentParams.category ?? "");
  const [provinceSlug, setProvinceSlug] = useState(currentParams.province ?? "all");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const q = formData.get("q") as string;
    const province = (formData.get("province") as string) || provinceSlug;

    if (q) params.set("q", q);
    if (province && province !== "all") params.set("province", province);
    if (categorySlug) params.set("category", categorySlug);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <h2 className="font-semibold">Filters</h2>

      <div>
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={currentParams.q}
          placeholder="e.g. plumber, web design, electrician..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by service, trade, category, or business name
        </p>
      </div>

      <div>
        <Label>Province</Label>
        <input type="hidden" name="province" value={provinceSlug} />
        <Select value={provinceSlug} onValueChange={setProvinceSlug}>
          <SelectTrigger>
            <SelectValue placeholder="All provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All provinces</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.slug}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CategoryTreeSelect
        categories={categories}
        value={categorySlug || undefined}
        onChange={setCategorySlug}
        valueMode="slug"
        includeAll
        label="Category"
        parentPlaceholder="All industries"
        childPlaceholder="All trades in this industry"
      />

      <Button type="submit" className="w-full">
        Apply Filters
      </Button>
    </form>
  );
}
