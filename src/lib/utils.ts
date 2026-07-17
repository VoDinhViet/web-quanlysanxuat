import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = words.at(0)?.[0] ?? ""
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : ""

  return `${first}${last}`.toUpperCase()
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
