import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      <h2 className="text-xl font-bold tracking-tight text-sa-blue sm:text-2xl">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-sa-green hover:underline"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
