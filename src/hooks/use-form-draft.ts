import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useStore } from "zustand"
import { createStore } from "zustand/vanilla"
import { persist } from "zustand/middleware"
import type { AnyFormApi } from "@tanstack/react-form"

import {
  collectDraftFileIds,
  holdDraftFiles,
  releaseDraftFiles,
  removeDraftFiles,
} from "@/lib/draft-files"
import type { HoldDraftFilesResult } from "@/lib/draft-files"

// Must match the backend's `UPLOAD_DRAFT_TTL` (30 days): a draft and its uploaded files expire
// together.
export const FORM_DRAFT_TTL_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

// A fixed toast id makes React StrictMode's double effect (dev only) show one toast, not two.
const DRAFT_TOAST_ID = "form-draft-notice"

type DraftStoreState<T> = {
  draft: T | null
  /**
   * ISO time after which the draft, and its files on the server, are dropped. `null` means the
   * draft was saved before expiry tracking existed, or the last file hold failed: it is checked
   * against the server the next time the form opens.
   */
  expiresAt: string | null
  saveDraft: (value: T, expiresAt: string | null) => void
  clearDraft: () => void
}

function createDraftStore<T>(storageKey: string) {
  return createStore<DraftStoreState<T>>()(
    persist(
      (set) => ({
        draft: null,
        expiresAt: null,
        saveDraft: (value: T, expiresAt: string | null) =>
          set({ draft: value, expiresAt }),
        clearDraft: () => set({ draft: null, expiresAt: null }),
      }),
      // skipHydration: read from localStorage only after mount (see the
      // `rehydrate()` call below), not synchronously at store-creation time —
      // server and first client render both see `draft: null`, avoiding an
      // SSR hydration mismatch.
      { name: storageKey, skipHydration: true }
    )
  )
}

type DraftStore<T> = ReturnType<typeof createDraftStore<T>>

function newDraftExpiresAt(): string {
  return new Date(Date.now() + FORM_DRAFT_TTL_DAYS * MS_PER_DAY).toISOString()
}

function applyHold<T>(store: DraftStore<T>, held: HoldDraftFilesResult): void {
  const { draft } = store.getState()

  if (held.missingFileIds.length === 0 || !draft) {
    store.setState({ expiresAt: held.expiresAt })
    return
  }

  store.setState({
    draft: removeDraftFiles(draft, held.missingFileIds),
    expiresAt: held.expiresAt,
  })
  toast.warning(
    `Có ${held.missingFileIds.length} tệp đính kèm không còn trên hệ thống, đã gỡ khỏi bản nháp. Vui lòng tải lên lại.`,
    { id: DRAFT_TOAST_ID }
  )
}

/**
 * Runs once after the draft is read from localStorage, before any form restores it.
 *
 * Rules:
 * - Past `expiresAt`: the whole draft is dropped. Its files are past their own deadline on the
 *   server, so there is nothing to release.
 * - No `expiresAt` and no files: starts the 30 days now.
 * - No `expiresAt` and files (a draft saved before expiry tracking): holds the files and drops the
 *   ones the server already swept, so the form is never restored with a dead file id.
 */
async function validateStoredDraft<T>(store: DraftStore<T>): Promise<void> {
  const { draft, expiresAt, clearDraft } = store.getState()

  if (!draft) {
    return
  }

  if (expiresAt) {
    if (Date.parse(expiresAt) <= Date.now()) {
      clearDraft()
      toast.info(
        `Bản nháp đã quá ${FORM_DRAFT_TTL_DAYS} ngày nên đã được xoá.`,
        { id: DRAFT_TOAST_ID }
      )
    }
    return
  }

  const fileIds = collectDraftFileIds(draft)

  if (fileIds.length === 0) {
    store.setState({ expiresAt: newDraftExpiresAt() })
    return
  }

  try {
    applyHold(store, await holdDraftFiles({ data: { fileIds } }))
  } catch {
    toast.warning(
      "Không kiểm tra được tệp đính kèm của bản nháp. Nếu tạo bị lỗi, hãy gỡ và tải lại tệp.",
      { id: DRAFT_TOAST_ID }
    )
  }
}

async function syncDraftFiles<T>(
  store: DraftStore<T>,
  fileIds: string[],
  previousFileIds: string[]
): Promise<void> {
  const droppedFileIds = previousFileIds.filter(
    (fileId) => !fileIds.includes(fileId)
  )

  if (droppedFileIds.length > 0) {
    // A missed release is harmless: those files just live until their own 30-day deadline.
    void releaseDraftFiles({ data: { fileIds: droppedFileIds } }).catch(
      () => undefined
    )
  }

  if (fileIds.length === 0) {
    return
  }

  try {
    applyHold(store, await holdDraftFiles({ data: { fileIds } }))
  } catch {
    // `expiresAt` is still null (see `saveDraft`), so the next open holds the files again.
    toast.warning(
      "Đã lưu nháp trên máy này nhưng chưa giữ được tệp đính kèm. Hãy lưu nháp lại.",
      { id: DRAFT_TOAST_ID }
    )
  }
}

/**
 * Persist a create-form's values to localStorage on demand (manual "Lưu nháp")
 * so the form auto-restores on reopen. SSR-safe: the store skips hydration
 * until after mount, so server and first client render both see `null`, then
 * `rehydrate()` reads the real value.
 *
 * The files uploaded into a draft are held on the server for as long as the draft lives (30 days
 * from the last save) instead of the 24 hours an unlinked upload normally gets. `draft` stays
 * `null` until the stored draft has been checked, so a form never restores a draft that is
 * expired or points at files the server already deleted.
 *
 * Never store secrets (tokens, passwords) here — strip them before `saveDraft`.
 */
export function useFormDraft<T>(storageKey: string) {
  const [store] = useState(() => createDraftStore<T>(storageKey))
  const [isChecked, setIsChecked] = useState(false)
  const validationRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    let isCancelled = false

    // The ref outlives StrictMode's second effect run, so the draft is checked (and its files held)
    // once, not twice.
    const validation = (validationRef.current ??= Promise.resolve(
      store.persist.rehydrate()
    )
      .then(() => validateStoredDraft(store))
      // An unreadable draft must not keep the form waiting: it just opens without one.
      .catch(() => undefined))

    void validation.then(() => {
      if (!isCancelled) {
        setIsChecked(true)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [store])

  const storedDraft = useStore(store, (state) => state.draft)
  const draft = isChecked ? storedDraft : null

  const saveDraft = useCallback(
    (value: T) => {
      const previousFileIds = collectDraftFileIds(store.getState().draft)
      const fileIds = collectDraftFileIds(value)

      // With files the deadline comes from the server (`applyHold`). If the tab closes before the
      // hold lands, the `null` sends the next open back through `validateStoredDraft` to repair it.
      store
        .getState()
        .saveDraft(value, fileIds.length > 0 ? null : newDraftExpiresAt())

      if (fileIds.length > 0 || previousFileIds.length > 0) {
        void syncDraftFiles(store, fileIds, previousFileIds)
      }
    },
    [store]
  )

  const clearDraft = useCallback(() => {
    const fileIds = collectDraftFileIds(store.getState().draft)

    store.getState().clearDraft()

    if (fileIds.length > 0) {
      // A missed release is harmless: the files just live until the draft's 30-day deadline.
      void releaseDraftFiles({ data: { fileIds } }).catch(() => undefined)
    }
  }, [store])

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
