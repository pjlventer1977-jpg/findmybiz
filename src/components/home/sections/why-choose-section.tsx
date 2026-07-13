import { Card, CardContent } from "@/components/ui/card";
import { SectionShell } from "@/components/home/section-shell";
import { WHY_CHOOSE_ITEMS } from "@/data/homepage";

export function WhyChooseSection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <SectionShell>
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Why Choose <span className="text-primary">FindMyBiz</span>?
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="rounded-2xl border-slate-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
