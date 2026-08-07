import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rounds to 2 decimal places — matches the backend's own round(..., 2) at every money
// computation step (see OrdersService.recalculateTotals), so client-side previews of order
// totals/item lines/currency conversions never drift from what the server stores.
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export interface SelectOptionItem {
  id: string
  name: string
}

export interface SelectOption {
  label: string
  value: string
}

// Turns `{id, name}` reference rows (departments, positions, roles) into
// select options.
export function buildSelectOptions(items: SelectOptionItem[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }))
}

// One-value counterpart of `buildSelectOptions`: maps a single optional
// `{id, name}` reference to a select/combobox option, or `undefined` when
// absent — for a preselected value handed to `ComboboxField`.
export function buildSelectOption(
  item: SelectOptionItem | null | undefined
): SelectOption | undefined {
  return item ? { value: item.id, label: item.name } : undefined
}

// Turns a domain label map ({ WORKING: "Đang làm việc" }) into select/radio
// options. Object.keys returns string[], so the cast restores the key type.
export function buildOptionsFromLabels<T extends string>(
  labels: Record<T, string>
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }))
}
