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
