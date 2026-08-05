"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Star, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { City, Province } from "@/types";

export type ServiceAreaSelection = {
  cityId: string;
  provinceId: string;
  cityName: string;
  provinceName: string;
};

type ServiceAreasSelectProps = {
  provinces: Province[];
  value: ServiceAreaSelection[];
  onChange: (areas: ServiceAreaSelection[]) => void;
  /** City id marked as primary / HQ (must be in value). */
  primaryCityId?: string;
  onPrimaryChange?: (cityId: string) => void;
  label?: string;
  maxSelections?: number;
  required?: boolean;
};

/**
 * Multi city/town picker for where a business provides services.
 */
export function ServiceAreasSelect({
  provinces,
  value,
  onChange,
  primaryCityId,
  onPrimaryChange,
  label = "Service areas",
  maxSelections = 20,
  required,
}: ServiceAreasSelectProps) {
  const [provinceId, setProvinceId] = useState("");
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    if (!provinceId) {
      setCities([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("cities")
      .select("*")
      .eq("province_id", provinceId)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, [provinceId]);

  const selectedIds = useMemo(() => new Set(value.map((v) => v.cityId)), [value]);
  const availableCities = cities.filter((c) => !selectedIds.has(c.id));

  function addCity(cityId: string) {
    const city = cities.find((c) => c.id === cityId);
    const province = provinces.find((p) => p.id === provinceId);
    if (!city || !province) return;
    if (value.length >= maxSelections) return;

    const next = [
      ...value,
      {
        cityId: city.id,
        provinceId: province.id,
        cityName: city.name,
        provinceName: province.name,
      },
    ];
    onChange(next);
    if (!primaryCityId && onPrimaryChange) {
      onPrimaryChange(city.id);
    }
  }

  function remove(cityId: string) {
    const next = value.filter((v) => v.cityId !== cityId);
    onChange(next);
    if (primaryCityId === cityId && onPrimaryChange) {
      onPrimaryChange(next[0]?.cityId ?? "");
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>
          {label}
          {required ? " *" : ""}
        </Label>
        <p className="text-xs text-muted-foreground">
          Add every city or town you serve. Mark one as your primary base.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Province</Label>
          <Select value={provinceId || undefined} onValueChange={setProvinceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Add city / town</Label>
          <Select
            key={`add-city-${value.length}-${provinceId}`}
            onValueChange={addCity}
            disabled={!provinceId || availableCities.length === 0 || value.length >= maxSelections}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !provinceId
                    ? "Select a province first"
                    : availableCities.length === 0
                      ? "No more cities in this province"
                      : "Select a city to add"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((area) => {
            const isPrimary = primaryCityId === area.cityId;
            return (
              <li
                key={area.cityId}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-sa-green" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-sa-blue">{area.cityName}</p>
                    <p className="truncate text-xs text-muted-foreground">{area.provinceName}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {onPrimaryChange && (
                    <button
                      type="button"
                      onClick={() => onPrimaryChange(area.cityId)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                        isPrimary
                          ? "bg-sa-gold/20 font-semibold text-sa-blue"
                          : "text-muted-foreground hover:bg-white"
                      }`}
                      title="Set as primary base"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${isPrimary ? "fill-sa-gold text-sa-gold" : ""}`}
                        aria-hidden
                      />
                      {isPrimary ? "Primary" : "Make primary"}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${area.cityName}`}
                    className="rounded-full p-1 hover:bg-white"
                    onClick={() => remove(area.cityId)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        required && (
          <p className="text-xs text-muted-foreground">Add at least one city or town.</p>
        )
      )}

      {value.length >= maxSelections && (
        <p className="text-xs text-amber-700">Maximum of {maxSelections} service areas reached.</p>
      )}
    </div>
  );
}
