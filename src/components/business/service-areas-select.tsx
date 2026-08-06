"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Star, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

const WHOLE_PROVINCE_VALUE = "__whole_province__";

type ServiceAreasSelectProps = {
  provinces: Province[];
  value: ServiceAreaSelection[];
  onChange: (areas: ServiceAreaSelection[]) => void;
  wholeProvinceIds: string[];
  onWholeProvincesChange: (provinceIds: string[]) => void;
  /** City id marked as primary / HQ. */
  primaryCityId?: string;
  onPrimaryChange?: (cityId: string) => void;
  label?: string;
  maxSelections?: number;
  required?: boolean;
};

/**
 * Multi city/town picker with optional whole-province coverage.
 */
export function ServiceAreasSelect({
  provinces,
  value,
  onChange,
  wholeProvinceIds,
  onWholeProvincesChange,
  primaryCityId,
  onPrimaryChange,
  label = "Service areas",
  maxSelections = 20,
  required,
}: ServiceAreasSelectProps) {
  const [provinceId, setProvinceId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [primaryPickProvinceId, setPrimaryPickProvinceId] = useState("");
  const [primaryPickCities, setPrimaryPickCities] = useState<City[]>([]);

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

  useEffect(() => {
    if (!primaryPickProvinceId) {
      setPrimaryPickCities([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("cities")
      .select("*")
      .eq("province_id", primaryPickProvinceId)
      .order("name")
      .then(({ data }) => setPrimaryPickCities(data ?? []));
  }, [primaryPickProvinceId]);

  const wholeProvinceSet = useMemo(
    () => new Set(wholeProvinceIds),
    [wholeProvinceIds]
  );
  const selectedIds = useMemo(() => new Set(value.map((v) => v.cityId)), [value]);

  const availableCities = cities.filter(
    (c) => !selectedIds.has(c.id) && !wholeProvinceSet.has(c.province_id)
  );

  const provinceCovered = provinceId ? wholeProvinceSet.has(provinceId) : false;

  const hasCoverage = value.length > 0 || wholeProvinceIds.length > 0;

  const wholeProvinceLabels = wholeProvinceIds
    .map((id) => provinces.find((p) => p.id === id))
    .filter((p): p is Province => Boolean(p));

  /** Cities listed for primary selection when coverage is whole-province only. */
  const needsPrimaryFromProvince =
    Boolean(onPrimaryChange) &&
    wholeProvinceIds.length > 0 &&
    !value.some((a) => a.cityId === primaryCityId);

  function addWholeProvince() {
    if (!provinceId || wholeProvinceSet.has(provinceId)) return;
    const nextProvinces = [...wholeProvinceIds, provinceId];
    onWholeProvincesChange(nextProvinces);
    // Drop redundant city chips in this province
    const remaining = value.filter((a) => a.provinceId !== provinceId);
    if (remaining.length !== value.length) {
      onChange(remaining);
      if (primaryCityId && !remaining.some((a) => a.cityId === primaryCityId)) {
        // Keep primary if it was in this province — still valid under whole coverage
      }
    }
    if (!primaryCityId) {
      setPrimaryPickProvinceId(provinceId);
    }
  }

  function addCity(cityId: string) {
    if (cityId === WHOLE_PROVINCE_VALUE) {
      addWholeProvince();
      return;
    }

    const city = cities.find((c) => c.id === cityId);
    const province = provinces.find((p) => p.id === provinceId);
    if (!city || !province) return;
    if (wholeProvinceSet.has(province.id)) return;
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

  function removeCity(cityId: string) {
    const next = value.filter((v) => v.cityId !== cityId);
    onChange(next);
    if (primaryCityId === cityId && onPrimaryChange) {
      const fallback =
        next[0]?.cityId ??
        (wholeProvinceIds.length > 0 ? primaryCityId : "");
      if (!next.some((a) => a.cityId === primaryCityId) && wholeProvinceIds.length === 0) {
        onPrimaryChange(fallback === primaryCityId ? "" : next[0]?.cityId ?? "");
      } else if (!next.some((a) => a.cityId === primaryCityId) && wholeProvinceIds.length > 0) {
        // Keep primary city id if still under whole-province coverage; otherwise clear for re-pick
        setPrimaryPickProvinceId(wholeProvinceIds[0] ?? "");
      }
    }
  }

  function removeWholeProvince(id: string) {
    const next = wholeProvinceIds.filter((p) => p !== id);
    onWholeProvincesChange(next);
    if (primaryCityId && onPrimaryChange) {
      const stillInCityList = value.some((a) => a.cityId === primaryCityId);
      // If primary was only justified by this province, user may need to re-pick
      if (!stillInCityList && next.length === 0 && !stillInCityList) {
        onPrimaryChange(value[0]?.cityId ?? "");
      }
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
          Add cities you serve, or choose whole province coverage. Mark one city as your primary
          base.
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
                  {wholeProvinceSet.has(p.id) ? " (whole province)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Add coverage</Label>
          <Select
            key={`add-coverage-${value.length}-${wholeProvinceIds.length}-${provinceId}`}
            onValueChange={addCity}
            disabled={
              !provinceId ||
              provinceCovered ||
              (availableCities.length === 0 && provinceCovered)
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !provinceId
                    ? "Select a province first"
                    : provinceCovered
                      ? "Whole province already selected"
                      : "City / town or whole province"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WHOLE_PROVINCE_VALUE}>
                Whole {provinces.find((p) => p.id === provinceId)?.name ?? "province"}{" "}
                (all cities and towns)
              </SelectItem>
              {availableCities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {provinceId && !provinceCovered && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={addWholeProvince}
        >
          Serve whole {provinces.find((p) => p.id === provinceId)?.name}
        </Button>
      )}

      {(wholeProvinceLabels.length > 0 || value.length > 0) && (
        <ul className="space-y-2">
          {wholeProvinceLabels.map((province) => (
            <li
              key={`prov-${province.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-sa-green/30 bg-sa-green/5 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-sa-green" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-sa-blue">
                    Whole {province.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    All cities and towns in this province
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Remove whole ${province.name}`}
                className="rounded-full p-1 hover:bg-white"
                onClick={() => removeWholeProvince(province.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}

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
                    onClick={() => removeCity(area.cityId)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Primary HQ picker when coverage is whole-province and primary not from city chips */}
      {onPrimaryChange && wholeProvinceIds.length > 0 && (
        <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3">
          <Label className="text-xs">Primary base city *</Label>
          <p className="text-xs text-muted-foreground">
            Choose your main office or base town (used on your public listing).
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select
              value={primaryPickProvinceId || wholeProvinceIds[0]}
              onValueChange={setPrimaryPickProvinceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {wholeProvinceLabels.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
                {/* Also allow provinces of individually selected cities */}
                {value
                  .map((a) => a.provinceId)
                  .filter((id, i, arr) => arr.indexOf(id) === i)
                  .filter((id) => !wholeProvinceSet.has(id))
                  .map((id) => {
                    const p = provinces.find((x) => x.id === id);
                    return p ? (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ) : null;
                  })}
              </SelectContent>
            </Select>
            <Select
              key={`primary-city-${primaryPickProvinceId}-${primaryCityId}`}
              value={primaryCityId || undefined}
              onValueChange={(id) => onPrimaryChange(id)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary city" />
              </SelectTrigger>
              <SelectContent>
                {(primaryPickCities.length
                  ? primaryPickCities
                  : cities.filter((c) =>
                      wholeProvinceIds.includes(c.province_id)
                    )
                ).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsPrimaryFromProvince && !primaryCityId && (
            <p className="text-xs text-amber-700">Select a primary base city to continue.</p>
          )}
        </div>
      )}

      {required && !hasCoverage && (
        <p className="text-xs text-muted-foreground">
          Add at least one city/town or whole province.
        </p>
      )}

      {value.length >= maxSelections && (
        <p className="text-xs text-amber-700">
          Maximum of {maxSelections} individual cities reached (whole provinces do not count
          toward this limit).
        </p>
      )}
    </div>
  );
}
