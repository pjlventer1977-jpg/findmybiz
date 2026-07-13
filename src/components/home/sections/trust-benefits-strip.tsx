import { SectionShell } from "@/components/home/section-shell";
import { TRUST_BENEFITS } from "@/data/homepage";

export function TrustBenefitsStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-5">
      <SectionShell>
        <div className="grid grid-cols-1 gap-4 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {TRUST_BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 px-0 lg:px-4 first:lg:pl-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sa-green">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-sa-blue">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
