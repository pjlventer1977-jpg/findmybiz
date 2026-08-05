"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

const ALL_VALUE = "__all__";

type CategoryTreeSelectProps = {
  categories: Category[];
  /** Currently selected category id or slug (prefer subcategory). */
  value?: string;
  /** Emits category id, or slug when `valueMode="slug"`. Empty string when cleared / all. */
  onChange: (value: string) => void;
  /** Match `value` / emit as database id (default) or URL slug. */
  valueMode?: "id" | "slug";
  /** Optional form field name — stores selected id or slug via hidden input. */
  name?: string;
  required?: boolean;
  label?: string;
  /** Show an “All categories” option (search filters). */
  includeAll?: boolean;
  parentPlaceholder?: string;
  childPlaceholder?: string;
};

function findSelection(
  categories: Category[],
  value: string | undefined,
  valueMode: "id" | "slug"
): { parentKey: string; childKey: string } {
  if (!value) return { parentKey: "", childKey: "" };

  for (const parent of categories) {
    const parentMatch =
      valueMode === "slug" ? parent.slug === value : parent.id === value;
    if (parentMatch) return { parentKey: parent.id, childKey: "" };

    const child = parent.children?.find((c) =>
      valueMode === "slug" ? c.slug === value : c.id === value
    );
    if (child) return { parentKey: parent.id, childKey: child.id };
  }
  return { parentKey: "", childKey: "" };
}

function emitValue(
  parent: Category | null,
  child: Category | undefined,
  valueMode: "id" | "slug"
): string {
  if (child) return valueMode === "slug" ? child.slug : child.id;
  if (parent) return valueMode === "slug" ? parent.slug : parent.id;
  return "";
}

/**
 * Two-step category picker: industry (parent) then SA trade/service (subcategory).
 */
export function CategoryTreeSelect({
  categories,
  value,
  onChange,
  valueMode = "id",
  name,
  required,
  label = "Category",
  includeAll = false,
  parentPlaceholder = "Select industry",
  childPlaceholder = "Select a specific service",
}: CategoryTreeSelectProps) {
  const initial = findSelection(categories, value, valueMode);
  const [parentId, setParentId] = useState(initial.parentKey);
  const [childId, setChildId] = useState(initial.childKey);

  useEffect(() => {
    const next = findSelection(categories, value, valueMode);
    setParentId(next.parentKey);
    setChildId(next.childKey);
  }, [categories, value, valueMode]);

  const parent = useMemo(
    () => categories.find((c) => c.id === parentId) ?? null,
    [categories, parentId]
  );
  const children = parent?.children ?? [];
  const selectedChild = children.find((c) => c.id === childId);
  const emitted = emitValue(parent, selectedChild, valueMode);

  function selectParent(nextParentId: string) {
    if (nextParentId === ALL_VALUE) {
      setParentId("");
      setChildId("");
      onChange("");
      return;
    }

    setParentId(nextParentId);
    setChildId("");
    const next = categories.find((c) => c.id === nextParentId) ?? null;
    if (next && (!next.children || next.children.length === 0)) {
      onChange(emitValue(next, undefined, valueMode));
    } else if (next && !required) {
      // Allow parent-only filter (e.g. search) before subcategory is chosen
      onChange(emitValue(next, undefined, valueMode));
    } else {
      onChange("");
    }
  }

  function selectChild(nextChildId: string) {
    setChildId(nextChildId);
    const child = children.find((c) => c.id === nextChildId);
    onChange(emitValue(parent, child, valueMode));
  }

  const parentSelectValue = includeAll
    ? parentId || ALL_VALUE
    : parentId || undefined;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Select
          value={parentSelectValue}
          onValueChange={selectParent}
          required={required && !includeAll}
        >
          <SelectTrigger>
            <SelectValue placeholder={parentPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {includeAll && (
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            )}
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {children.length > 0 && (
        <div className="space-y-1.5">
          <Label>Subcategory / trade</Label>
          <Select
            value={childId || undefined}
            onValueChange={selectChild}
            required={required}
          >
            <SelectTrigger>
              <SelectValue placeholder={childPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {name && <input type="hidden" name={name} value={emitted} required={required} />}
    </div>
  );
}
