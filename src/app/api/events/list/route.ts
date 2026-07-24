import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { EVENT_DURATION_OPTIONS } from "@/constants/membership";
import { createEventPayment } from "@/lib/payfast";
import { createServiceClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
    return NextResponse.json(
      { error: "Payment gateway is not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const banner = formData.get("banner");
  const durationWeeks = Number(formData.get("durationWeeks"));
  const duration = EVENT_DURATION_OPTIONS.find((option) => option.weeks === durationWeeks);

  if (!(banner instanceof File) || !duration) {
    return NextResponse.json(
      { error: "Upload a poster and choose an advertising duration." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(banner.type) || banner.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Poster must be a JPG, PNG, or WebP image no larger than 5MB." },
      { status: 400 }
    );
  }

  const serviceClient = await createServiceClient();
  const extension = banner.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${randomUUID()}.${extension}`;
  const storagePath = `guest/${fileName}`;
  const { error: uploadError } = await serviceClient.storage
    .from("event-banners")
    .upload(storagePath, Buffer.from(await banner.arrayBuffer()), {
      contentType: banner.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return NextResponse.json({ error: "Could not upload your event poster." }, { status: 500 });
  }

  const { data: bannerUrlData } = serviceClient.storage
    .from("event-banners")
    .getPublicUrl(storagePath);
  const paymentId = randomUUID();
  const eventSlug = `event-listing-${Date.now().toString(36)}-${paymentId.slice(0, 8)}`;
  const { data: event, error: eventError } = await serviceClient
    .from("events")
    .insert({
      name: "Event Listing",
      slug: eventSlug,
      banner_url: bannerUrlData.publicUrl,
      event_date: new Date().toISOString(),
      status: "pending",
      is_paid: false,
    })
    .select("id")
    .single();

  if (eventError || !event) {
    await serviceClient.storage.from("event-banners").remove([storagePath]);
    return NextResponse.json({ error: "Could not create your event advert." }, { status: 500 });
  }

  const { error: paymentError } = await serviceClient.from("payments").insert({
    amount: duration.price,
    payment_type: "event",
    status: "pending",
    m_payment_id: paymentId,
    metadata: { event_id: event.id, duration_weeks: duration.weeks },
  });

  if (paymentError) {
    await serviceClient.from("events").delete().eq("id", event.id);
    await serviceClient.storage.from("event-banners").remove([storagePath]);
    return NextResponse.json({ error: "Could not create your payment." }, { status: 500 });
  }

  return NextResponse.json(
    createEventPayment({
      email: process.env.EVENT_LISTING_EMAIL ?? "events@findmybiz.co.za",
      eventName: "Event Listing",
      amount: duration.price,
      paymentId,
      durationWeeks: duration.weeks,
    })
  );
}
