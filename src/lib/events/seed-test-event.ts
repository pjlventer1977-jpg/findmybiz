import type { SupabaseClient } from "@supabase/supabase-js";

const TEST_EVENT_SLUG = "afrikaans-in-die-wolke-2026";
const TEST_EVENT_BANNER_PATH = "/events/afrikaans-in-die-wolke.png";

export const TEST_EVENT = {
  name: "Afrikaans in die Wolke",
  slug: TEST_EVENT_SLUG,
  description:
    "Afrikaans music festival at Hoërskool Noordheuwel. Featuring Bernice West, Bok van Blerk, Steve Hofmeyr, Snotkop, G-String, Early B, and Zaan Sonnekus. MC: Hamilton Wessels. R250 per person.",
  eventDate: "2026-09-12T10:00:00+02:00",
  endDate: "2026-09-12T22:00:00+02:00",
  venue: "Hoërskool Noordheuwel",
  contactPhone: "011 954 1032",
  contactEmail: "bemarkings@noories.co.za",
  category: "Festival",
  ticketLink: "mailto:bemarkings@noories.co.za",
} as const;

export async function seedAfrikaansTestEvent(
  supabase: SupabaseClient
): Promise<{ eventId: string; bannerUrl: string }> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za").replace(
    /\/$/,
    ""
  );
  const bannerUrl = `${appUrl}${TEST_EVENT_BANNER_PATH}`;
  const paidUntil = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();

  const { data: province } = await supabase
    .from("provinces")
    .select("id")
    .eq("slug", "gauteng")
    .maybeSingle();

  const payload = {
    name: TEST_EVENT.name,
    slug: TEST_EVENT.slug,
    description: TEST_EVENT.description,
    banner_url: bannerUrl,
    event_date: TEST_EVENT.eventDate,
    end_date: TEST_EVENT.endDate,
    venue: TEST_EVENT.venue,
    province_id: province?.id ?? null,
    contact_phone: TEST_EVENT.contactPhone,
    contact_email: TEST_EVENT.contactEmail,
    category: TEST_EVENT.category,
    ticket_link: TEST_EVENT.ticketLink,
    status: "approved" as const,
    is_paid: true,
    paid_until: paidUntil,
  };

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", TEST_EVENT.slug)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not update test event.");
    }

    return { eventId: data.id, bannerUrl };
  }

  const { data, error } = await supabase.from("events").insert(payload).select("id").single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create test event.");
  }

  return { eventId: data.id, bannerUrl };
}
