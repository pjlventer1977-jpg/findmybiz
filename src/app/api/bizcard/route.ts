import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const name = request.nextUrl.searchParams.get("name");

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://findmybiz.co.za";
  const profileUrl = `${appUrl}/business/${slug}`;

  const qrDataUrl = await QRCode.toDataURL(profileUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#007A4D", light: "#FFFFFF" },
  });

  return NextResponse.json({
    qr_code: qrDataUrl,
    profile_url: profileUrl,
    business_name: name,
  });
}
