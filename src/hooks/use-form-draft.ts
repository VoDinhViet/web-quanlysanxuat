import { useEffect, useState } from "react"
import { useStore } from "zustand"
import { createStore } from "zustand/vanilla"
import { persist } from "zustand/middleware"
import type { AnyFormApi } from "@tanstack/react-form"

type DraftStoreState<T> = {
  draft: T | null
  saveDraft: (value: T) => void
  clearDraft: () => void
}

function createDraftStore<T>(storageKey: string) {
  return createStore<DraftStoreState<T>>()(
    persist(
      (set) => ({
        draft: null,
        saveDraft: (value: T) => set({ draft: value }),
        clearDraft: () => set({ draft: null }),
      }),
      // skipHydration: read from localStorage only after mount (see the
      // `rehydrate()` call below), not synchronously at store-creation time —
      // server and first client render both see `draft: null`, avoiding an
      // SSR hydration mismatch.
      { name: storageKey, skipHydration: true }
    )
  )
}

/**
 * Persist a create-form's values to localStorage on demand (manual "Lưu nháp")
 * so the form auto-restores on reopen. SSR-safe: the store skips hydration
 * until after mount, so server and first client render both see `null`, then
 * `rehydrate()` reads the real value.
 *
 * Never store secrets (tokens, passwords) here — strip them before `saveDraft`.
 */
export function useFormDraft<T>(storageKey: string) {
  const [store] = useState(() => createDraftStore<T>(storageKey))

  useEffect(() => {
    void store.persist.rehydrate()
  }, [store])

  const draft = useStore(store, (state) => state.draft)
  const saveDraft = useStore(store, (state) => state.saveDraft)
  const clearDraft = useStore(store, (state) => state.clearDraft)

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
