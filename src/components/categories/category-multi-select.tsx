"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

type CategoryMultiSelectProps = {
  categories: Category[];
  value: string[];
  onChange: (categoryIds: string[]) => void;
  label?: string;
  maxSelections?: number;
  required?: boolean;
};

/**
 * Pick one or more SA trade subcategories (optionally across industries).
 */
export function CategoryMultiSelect({
  categories,
  value,
  onChange,
  label = "Service categories",
  maxSelections = 8,
  required,
}: CategoryMultiSelectProps) {
  const [parentId, setParentId] = useState("");

  const parent = useMemo(
    () => categories.find((c) => c.id === parentId) ?? null,
    [categories, parentId]
  );
  const children = parent?.children ?? [];

  const selectedById = useMemo(() => {
    const map = new Map<string, { id: string; name: string; parentName: string }>();
    for (const p of categories) {
      for (const child of p.children ?? []) {
        if (value.includes(child.id)) {
          map.set(child.id, {
            id: child.id,
            name: child.name,
            parentName: p.name,
          });
        }
      }
      // Allow parent-only if no children (shouldn't happen in SA taxonomy)
      if ((!p.children || p.children.length === 0) && value.includes(p.id)) {
        map.set(p.id, { id: p.id, name: p.name, parentName: p.name });
      }
    }
    return map;
  }, [categories, value]);

  function toggleChild(childId: string) {
    if (value.includes(childId)) {
      onChange(value.filter((id) => id !== childId));
      return;
    }
    if (value.length >= maxSelections) return;
    onChange([...value, childId]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>
          {label}
          {required ? " *" : ""}
        </Label>
        <p className="text-xs text-muted-foreground">
          Select every trade you offer (up to {maxSelections}). Customers find you under each one.
        </p>
        <Select value={parentId || undefined} onValueChange={setParentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an industry to browse" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {children.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
          {children.map((child) => {
            const checked = value.includes(child.id);
            const disabled = !checked && value.length >= maxSelections;
            return (
              <label
                key={child.id}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 ${
                  disabled ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sa-green"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleChild(child.id)}
                />
                <span>{child.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...selectedById.values()].map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full border border-sa-green/30 bg-sa-green/10 px-2.5 py-1 text-xs font-medium text-sa-blue"
            >
              <span className="max-w-[14rem] truncate" title={`${item.parentName} · ${item.name}`}>
                {item.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                className="rounded-full p-0.5 hover:bg-sa-green/20"
                onClick={() => remove(item.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {required && value.length === 0 && (
        <p className="text-xs text-muted-foreground">Add at least one subcategory.</p>
      )}

      {value.length >= maxSelections && (
        <p className="text-xs text-amber-700">Maximum of {maxSelections} categories reached.</p>
      )}

      {/* Keep a stable control for form semantics when used outside controlled submit */}
      <input type="hidden" value={value.join(",")} readOnly aria-hidden />
      {value.length === 0 && required && (
        <Button type="button" variant="ghost" className="hidden" tabIndex={-1} />
      )}
    </div>
  );
}
