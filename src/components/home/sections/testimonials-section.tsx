import { TestimonialCard } from "@/components/home/cards/testimonial-card";
import { SectionShell } from "@/components/home/section-shell";
import { TESTIMONIALS } from "@/data/homepage";

export function TestimonialsSection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <SectionShell>
        <h2 className="mb-6 text-center text-2xl font-bold text-sa-blue sm:text-3xl">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
