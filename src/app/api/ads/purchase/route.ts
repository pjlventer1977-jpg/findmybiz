import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getAdDurationDays,
  getAdPrice,
  getAdProduct,
  type AdBillingPeriod,
  type AdProductType,
} from "@/constants/membership";
import { createAdPayment } from "@/lib/payfast";
import { getCanonicalAppUrl } from "@/lib/app-url";
import { uploadAdBanner, validateAdBannerFile } from "@/lib/storage/ad-banner";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const VALID_TYPES: AdProductType[] = ["featured_ad", "banner_home", "banner_category"];
const VALID_PERIODS: AdBillingPeriod[] = ["week", "month"];

export async function POST(request: NextRequest) {
  if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
    return NextResponse.json(
      { error: "Payment gateway is not configured" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to purchase advertising." }, { status: 401 });
  }

  const formData = await request.formData();
  const productType = formData.get("productType");
  const period = formData.get("period");
  const businessId = formData.get("businessId");
  const categoryId = formData.get("categoryId");
  const banner = formData.get("banner");

  if (typeof productType !== "string" || !VALID_TYPES.includes(productType as AdProductType)) {
    return NextResponse.json({ error: "Invalid ad product." }, { status: 400 });
  }

  if (typeof period !== "string" || !VALID_PERIODS.includes(period as AdBillingPeriod)) {
    return NextResponse.json({ error: "Choose weekly or monthly billing." }, { status: 400 });
  }

  if (typeof businessId !== "string" || !businessId) {
    return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
  }

  const typedProduct = productType as AdProductType;
  const typedPeriod = period as AdBillingPeriod;
  const product = getAdProduct(typedProduct);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, status")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  if (business.status !== "approved") {
    return NextResponse.json(
      { error: "Your business must be approved before purchasing ads." },
      { status: 400 }
    );
  }

  if (product.requiresCategory) {
    if (typeof categoryId !== "string" || !categoryId) {
      return NextResponse.json({ error: "Choose a category for this banner." }, { status: 400 });
    }

    const { data: categoryLink } = await supabase
      .from("business_categories")
      .select("category_id")
      .eq("business_id", businessId)
      .eq("category_id", categoryId)
      .maybeSingle();

    if (!categoryLink) {
      return NextResponse.json(
        { error: "Select one of your business categories." },
        { status: 400 }
      );
    }
  }

  const serviceClient = await createServiceClient();
  const paymentId = randomUUID();
  const amount = getAdPrice(typedProduct, typedPeriod);
  const durationDays = getAdDurationDays(typedPeriod);
  const periodLabel = typedPeriod === "week" ? "1 week" : "1 month";
  const appUrl = getCanonicalAppUrl();
  const metadata: Record<string, unknown> = {
    business_id: businessId,
    product_type: typedProduct,
    period: typedPeriod,
    duration_days: durationDays,
    type: typedProduct,
  };

  let bannerAdId: string | null = null;

  if (product.requiresImage) {
    if (!(banner instanceof File) || banner.size === 0) {
      return NextResponse.json({ error: "Banner image is required." }, { status: 400 });
    }

    const validationError = validateAdBannerFile(banner);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const placement = typedProduct === "banner_home" ? "home" : "category";
    const { data: bannerAd, error: bannerError } = await serviceClient
      .from("banner_ads")
      .insert({
        business_id: businessId,
        title: business.name,
        image_url: "",
        link_url: `${appUrl}/business/${business.slug}`,
        placement,
        category_id: placement === "category" ? categoryId : null,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        is_active: false,
      })
      .select("id")
      .single();

    if (bannerError || !bannerAd) {
      return NextResponse.json({ error: "Could not create banner advert." }, { status: 500 });
    }

    bannerAdId = bannerAd.id;
    metadata.banner_ad_id = bannerAd.id;

    try {
      const imageUrl = await uploadAdBanner(serviceClient, user.id, bannerAd.id, banner);
      await serviceClient
        .from("banner_ads")
        .update({ image_url: imageUrl })
        .eq("id", bannerAd.id);
    } catch (uploadErr) {
      await serviceClient.from("banner_ads").delete().eq("id", bannerAd.id);
      const message = uploadErr instanceof Error ? uploadErr.message : "Banner upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { data: paymentRow, error: paymentError } = await serviceClient
    .from("payments")
    .insert({
      business_id: businessId,
      amount,
      payment_type: typedProduct,
      status: "pending",
      m_payment_id: paymentId,
      metadata,
    })
    .select("id")
    .single();

  if (paymentError || !paymentRow) {
    if (bannerAdId) {
      await serviceClient.from("banner_ads").delete().eq("id", bannerAdId);
    }
    return NextResponse.json({ error: "Could not create payment." }, { status: 500 });
  }

  if (bannerAdId) {
    await serviceClient
      .from("banner_ads")
      .update({ payment_id: paymentRow.id })
      .eq("id", bannerAdId);
  }

  return NextResponse.json(
    createAdPayment({
      email: user.email!,
      productTitle: product.title,
      amount,
      paymentId,
      periodLabel,
    })
  );
}
