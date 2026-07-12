"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BizCardProps {
  slug: string;
  businessName: string;
}

export function BizCardGenerator({ slug, businessName }: BizCardProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    fetch(`/api/bizcard?slug=${slug}&name=${encodeURIComponent(businessName)}`)
      .then((r) => r.json())
      .then((data) => {
        setQrCode(data.qr_code);
        setProfileUrl(data.profile_url);
      });
  }, [slug, businessName]);

  function downloadQR() {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.download = `${slug}-bizcard-qr.png`;
    link.href = qrCode;
    link.click();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital BizCard</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {qrCode ? (
          <>
            <div className="inline-block p-4 bg-white border rounded-lg">
              <Image src={qrCode} alt="QR Code" width={200} height={200} />
            </div>
            <p className="font-semibold">{businessName}</p>
            <p className="text-sm text-muted-foreground break-all">{profileUrl}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={downloadQR}>Download QR</Button>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(profileUrl)}>
                Copy Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Print this QR code on your business cards, flyers, or shop window to drive customers to your profile.
            </p>
          </>
        ) : (
          <p>Generating QR code...</p>
        )}
      </CardContent>
    </Card>
  );
}
