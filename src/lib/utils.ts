import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type SelectOptionItem = {
  id: string
  name: string
}

type SelectOption = {
  value: string
  label: string
}

// Turns `{id, name}` reference rows (departments, positions, roles) into
// select options.
export function buildSelectOptions(items: SelectOptionItem[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }))
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
