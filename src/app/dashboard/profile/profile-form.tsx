"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogoUpload } from "@/components/business/logo-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileFormProps {
  business: {
    id: string;
    name: string;
    description?: string | null;
    phone: string;
    email: string;
    status: string;
    slug: string;
    logo_url?: string | null;
  };
}

export function ProfileForm({ business }: ProfileFormProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            businessId={business.id}
            currentLogoUrl={business.logo_url}
            onUploaded={() => router.refresh()}
          />
        </CardContent>
      </Card>

      <div className="space-y-4 p-6 border rounded-lg">
        {business.logo_url && (
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-lg overflow-hidden border">
              <Image
                src={business.logo_url}
                alt={business.name}
                width={64}
                height={64}
                className="object-cover h-full w-full"
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current logo shown on your public profile.
            </p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Business Name</label>
          <p>{business.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <p className="whitespace-pre-wrap">{business.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Phone</label>
            <p>{business.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p>{business.email}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="capitalize">{business.status}</p>
        </div>
        {business.status === "approved" && (
          <a
            href={`/business/${business.slug}`}
            className="text-primary underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            View public profile
          </a>
        )}
      </div>
    </div>
  );
}
