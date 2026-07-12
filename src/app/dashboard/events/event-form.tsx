"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { EVENT_PRICE_WEEKLY } from "@/constants/membership";

export function EventForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const supabase = createClient();

    const { data: event } = await supabase.from("events").insert({
      business_id: businessId,
      name,
      slug: slugify(name) + "-" + Date.now().toString(36),
      description: formData.get("description"),
      event_date: formData.get("event_date"),
      venue: formData.get("venue"),
      category: formData.get("category"),
      contact_phone: formData.get("contact_phone"),
      contact_email: formData.get("contact_email"),
      website: formData.get("website"),
      ticket_link: formData.get("ticket_link"),
      status: "pending",
    }).select().single();

    if (event) {
      alert(`Event created! Pay R${EVENT_PRICE_WEEKLY} to activate listing. Admin approval required.`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List an Event</CardTitle>
        <p className="text-sm text-muted-foreground">
          R{EVENT_PRICE_WEEKLY}/week — admin approval required
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Event Date *</Label>
              <Input id="event_date" name="event_date" type="datetime-local" required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Market, Festival" />
            </div>
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" name="venue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input id="contact_phone" name="contact_phone" />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input id="contact_email" name="contact_email" type="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" />
          </div>
          <div>
            <Label htmlFor="ticket_link">Ticket Link</Label>
            <Input id="ticket_link" name="ticket_link" type="url" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
