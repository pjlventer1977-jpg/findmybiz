import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: LucideIcon;
  className?: string;
}

export function CategoryCard({ name, slug, icon: Icon, className }: CategoryCardProps) {
  return (
    <Link
      href={`/search?category=${slug}`}
      className={cn(
        "group flex flex-col items-center rounded-xl border border-slate-100 bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-sa-green hover:shadow-sm",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sa-green/10 text-sa-green transition-colors group-hover:bg-sa-green group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-slate-800">
        {name}
      </span>
    </Link>
  );
}
