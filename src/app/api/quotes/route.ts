import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  routeLeadsToBusinesses,
} from "@/lib/lead-router";
import { getLeadCreditsBalance } from "@/lib/lead-credits";
import { sendLeadNotificationEmail } from "@/lib/email/lead-notification";
import { z } from "zod";

const quoteSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  province_id: z.string().uuid(),
  city_id: z.string().uuid(),
  category_id: z.string().uuid(),
  service_description: z.string().min(10),
  budget: z.string().nullable().optional(),
  popia_consent: z.literal(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createServiceClient();

    const { data: quoteRequest, error: quoteError } = await supabase
      .from("quote_requests")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        province_id: data.province_id,
        city_id: data.city_id,
        category_id: data.category_id,
        service_description: data.service_description,
        budget: data.budget,
        popia_consent: data.popia_consent,
        status: "processing",
      })
      .select()
      .single();

    if (quoteError || !quoteRequest) {
      return NextResponse.json(
        { error: "Failed to create quote request" },
        { status: 500 }
      );
    }

    const { data: businesses } = await supabase
      .from("businesses")
      .select(`
        id,
        membership_tier,
        city_id,
        province_id,
        phone,
        whatsapp,
        name,
        email,
        lead_response_rate,
        biz_trust_score,
        is_local_champion,
        business_categories(category_id),
        lead_credits(balance)
      `)
      .eq("status", "approved")
      .eq("province_id", data.province_id);

    const candidates = (businesses ?? []).map((b) => ({
      id: b.id,
      membership_tier: b.membership_tier,
      city_id: b.city_id,
      province_id: b.province_id,
      category_ids: b.business_categories?.map(
        (bc: { category_id: string }) => bc.category_id
      ) ?? [],
      lead_credits_balance: getLeadCreditsBalance(b.lead_credits),
      is_local_champion: b.is_local_champion,
      lead_response_rate: b.lead_response_rate,
      biz_trust_score: b.biz_trust_score,
      phone: b.phone,
      whatsapp: b.whatsapp,
      name: b.name,
      email: b.email,
    }));

    const routed = routeLeadsToBusinesses(candidates, {
      province_id: data.province_id,
      city_id: data.city_id,
      category_id: data.category_id,
    });

    const [{ data: province }, { data: city }, { data: category }] = await Promise.all([
      supabase.from("provinces").select("name").eq("id", data.province_id).single(),
      supabase.from("cities").select("name").eq("id", data.city_id).single(),
      supabase.from("categories").select("name").eq("id", data.category_id).single(),
    ]);

    const emailNotifications: Promise<{ success: boolean; error?: string }>[] = [];

    for (const business of routed) {
      await supabase.from("leads").insert({
        quote_request_id: quoteRequest.id,
        business_id: business.id,
        status: "new",
        credit_deducted: true,
      });

      const { error: deductError } = await supabase.rpc("deduct_lead_credit", {
        p_business_id: business.id,
      });

      if (deductError) {
        const { data: credits } = await supabase
          .from("lead_credits")
          .select("balance")
          .eq("business_id", business.id)
          .single();

        if (credits && credits.balance > 0) {
          await supabase
            .from("lead_credits")
            .update({ balance: credits.balance - 1 })
            .eq("business_id", business.id);

          await supabase.from("lead_credit_transactions").insert({
            business_id: business.id,
            amount: -1,
            balance_after: credits.balance - 1,
            transaction_type: "lead_delivery",
            reference_id: quoteRequest.id,
            description: "Lead delivered from quote request",
          });
        }
      }

      const original = candidates.find((c) => c.id === business.id);
      if (original?.email) {
        emailNotifications.push(
          sendLeadNotificationEmail({
            businessName: original.name,
            businessEmail: original.email,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerEmail: data.customer_email,
            serviceDescription: data.service_description,
            budget: data.budget ?? undefined,
            cityName: city?.name,
            provinceName: province?.name,
            categoryName: category?.name,
            whatsappNumber: original.whatsapp ?? undefined,
          })
        );
      }
    }

    const emailResults = await Promise.allSettled(emailNotifications);
    const emailsSent = emailResults.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const emailErrors = emailResults
      .filter((r) => r.status === "fulfilled" && !r.value.success)
      .map((r) => (r as PromiseFulfilledResult<{ error?: string }>).value.error);

    if (emailErrors.length > 0) {
      console.error("Lead email delivery failures:", emailErrors);
    }

    await supabase
      .from("quote_requests")
      .update({ status: "routed" })
      .eq("id", quoteRequest.id);

    return NextResponse.json({
      success: true,
      quote_request_id: quoteRequest.id,
      leads_routed: routed.length,
      emails_sent: emailsSent,
      emails_failed: emailErrors.length,
    });
  } catch (error) {
    console.error("Quote routing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
