import type { AnyFormApi } from "@tanstack/react-form"
import { useLocalStorage } from "usehooks-ts"

/**
 * Persist a create-form's values to localStorage on demand (manual "Lưu nháp")
 * so the form auto-restores on reopen. SSR-safe via usehooks-ts — server and
 * first client render both see `null`, then it hydrates.
 *
 * Never store secrets (tokens, passwords) here — strip them before `saveDraft`.
 */
export function useFormDraft<T>(storageKey: string) {
  const [draft, saveDraft, clearDraft] = useLocalStorage<T | null>(
    storageKey,
    null
  )

  return { draft, saveDraft, clearDraft }
}

/**
 * Write each of `values` into the form. `form.reset(values)` updates form state
 * but does NOT refresh already-mounted field inputs in this TanStack Form
 * version, whereas `setFieldValue` does — so restore/reset go through here.
 */
export function restoreFormDraft<T extends object>(
  form: AnyFormApi,
  values: T
): void {
  for (const [key, value] of Object.entries(values)) {
    form.setFieldValue(key, value)
  }
}
