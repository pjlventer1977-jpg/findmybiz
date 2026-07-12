"use client";

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const q = formData.get("q") as string;
    const province = formData.get("province") as string;
    const category = formData.get("category") as string;

    if (q) params.set("q", q);
    if (province && province !== "all") params.set("province", province);
    if (category && category !== "all") params.set("category", category);

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
          placeholder="Business name..."
        />
      </div>

      <div>
        <Label>Province</Label>
        <Select name="province" defaultValue={currentParams.province ?? "all"}>
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

      <div>
        <Label>Category</Label>
        <Select name="category" defaultValue={currentParams.category ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Apply Filters
      </Button>
    </form>
  );
}
