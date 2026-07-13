import { cn } from "@/lib/utils";

interface SectionShellProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
}

export function SectionShell({
  children,
  className,
  as: Tag = "div",
  id,
}: SectionShellProps) {
  return (
    <Tag id={id} className={cn("mx-auto w-full max-w-[1180px] px-4 sm:px-6", className)}>
      {children}
    </Tag>
  );
}
