"use client";

import { useEffect, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { EVENT_DURATION_OPTIONS } from "@/constants/membership";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Province, City } from "@/types";

interface EventAdvertFormProps {
  provinces: Province[];
}

export function EventAdvertForm({ provinces }: EventAdvertFormProps) {
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    if (!selectedProvinceId) {
      setCities([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("cities")
      .select("*")
      .eq("province_id", selectedProvinceId)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, [selectedProvinceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/events/list", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const payment = await response.json();

      if (!response.ok) {
        setError(payment.error ?? "Could not create your event advert.");
        return;
      }

      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = payment.action;

      Object.entries(payment.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch {
      setError("Could not continue to payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = EVENT_DURATION_OPTIONS.find(
    (option) => option.weeks === durationWeeks
  )!;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Advertise your event</CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in the details below. Your advert will be reviewed after payment before going live.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="eventName">Event name *</Label>
            <Input id="eventName" name="eventName" required placeholder="e.g. Afrikaans in die Wolke" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Contact number *</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" required placeholder="e.g. 011 954 1032" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" name="contactEmail" type="email" placeholder="e.g. info@example.co.za" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Province *</Label>
              <Select
                name="provinceId"
                required
                onValueChange={(value) => setSelectedProvinceId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City / town *</Label>
              <Select name="cityId" required disabled={!selectedProvinceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue">Venue name</Label>
            <Input id="venue" name="venue" placeholder="e.g. Hoërskool Noordheuwel" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date & time *</Label>
              <Input id="startDate" name="startDate" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date & time</Label>
              <Input id="endDate" name="endDate" type="datetime-local" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticketLink">Ticket link</Label>
            <Input id="ticketLink" name="ticketLink" type="url" placeholder="https://tickets.example.co.za" />
            <p className="text-xs text-muted-foreground">
              If tickets are sold online, paste the purchase URL.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="details">Details — artists, speakers, programme</Label>
            <Textarea
              id="details"
              name="details"
              rows={5}
              placeholder={`e.g.\n10:30  Bernice West\n12:00  Bok van Blerk\n13:30  Steve Hofmeyr\n\nFood & beverages on sale. Fun Park for kids.`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Event poster / banner *</Label>
            <input
              id="banner"
              name="banner"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sa-gold/20 file:px-3 file:py-1 file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum 5MB.</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Advertising duration *</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {EVENT_DURATION_OPTIONS.map((option) => (
                <label
                  key={option.weeks}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    durationWeeks === option.weeks
                      ? "border-sa-gold bg-sa-gold/10 ring-1 ring-sa-gold/40"
                      : "border-slate-200 bg-white hover:border-sa-gold/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="durationWeeks"
                    value={option.weeks}
                    checked={durationWeeks === option.weeks}
                    onChange={() => setDurationWeeks(option.weeks)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-sa-blue">{option.label}</span>
                  <span className="mt-1 block text-lg font-bold text-slate-900">
                    R{option.price}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Total price</p>
            <p className="text-2xl font-bold text-sa-blue">
              R{selectedOption.price}{" "}
              <span className="text-sm font-normal text-slate-600">
                for {selectedOption.label}
              </span>
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-sa-gold font-semibold text-slate-900 hover:bg-sa-gold/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing payment...
              </>
            ) : (
              <>
                <ImageUp className="mr-2 h-4 w-4" />
                Continue to Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
