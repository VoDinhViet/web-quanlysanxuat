import { useEffect, useState, useSyncExternalStore } from "react"
import type { RefObject } from "react"

type PasteSlot = {
  rootRef: RefObject<HTMLElement | null>
  inputRef: RefObject<HTMLInputElement | null>
}

type UsePasteToDropzoneOptions = PasteSlot & {
  disabled?: boolean
}

type UsePasteToDropzoneResult = {
  // True when this zone is the one a pasted image will land in AND the page has more than one
  // zone competing for it — the caller shows an indicator so the user knows where it goes.
  isPasteTarget: boolean
}

const DIALOG_SELECTOR = '[role="dialog"],[role="alertdialog"]'
const TEXT_FIELD_SELECTOR =
  'input:not([type="file"]),textarea,[contenteditable="true"]'

// One document-level listener shared by every mounted zone, so a paste lands in exactly one
// of them even when a page has several.
const slots = new Set<PasteSlot>()
const storeListeners = new Set<() => void>()
let lastActive: PasteSlot | null = null

function emit() {
  storeListeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  storeListeners.add(listener)
  return () => {
    storeListeners.delete(listener)
  }
}

function dialogOf(element: Element | null) {
  return element?.closest(DIALOG_SELECTOR) ?? null
}

// A paste only reaches zones in the same dialog as the focus (or the top-most open dialog when
// focus is on the body), so a page behind an open dialog never swallows the image.
function candidatesInScope(): PasteSlot[] {
  const openDialogs = Array.from(document.querySelectorAll(DIALOG_SELECTOR))
  const scope = dialogOf(document.activeElement) ?? openDialogs.at(-1) ?? null

  return [...slots].filter((slot) => dialogOf(slot.rootRef.current) === scope)
}

function pickTarget(candidates: PasteSlot[]): PasteSlot | undefined {
  return lastActive !== null && candidates.includes(lastActive)
    ? lastActive
    : candidates[0]
}

function handlePaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
    file.type.startsWith("image/")
  )
  if (files.length === 0) return

  // Copying spreadsheet cells puts both text and a PNG on the clipboard — pasting into a text
  // field should stay a text paste.
  const isInTextField =
    document.activeElement?.matches(TEXT_FIELD_SELECTOR) === true
  if (isInTextField && event.clipboardData?.types.includes("text/plain")) return

  const input = pickTarget(candidatesInScope())?.inputRef.current
  if (!input) return

  event.preventDefault()
  const transfer = new DataTransfer()
  files.forEach((file) => transfer.items.add(file))
  input.files = transfer.files
  // react-dropzone listens to the input's change event, so accept/maxSize/multiple validation and
  // the caller's onDropAccepted/onDropRejected all run exactly as for a picked file.
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

function register(slot: PasteSlot) {
  if (slots.size === 0) document.addEventListener("paste", handlePaste)
  slots.add(slot)
  emit()

  return () => {
    slots.delete(slot)
    if (lastActive === slot) lastActive = null
    if (slots.size === 0) document.removeEventListener("paste", handlePaste)
    emit()
  }
}

function isTarget(slot: PasteSlot) {
  if (!slots.has(slot)) return false
  const candidates = candidatesInScope()

  return candidates.length > 1 && pickTarget(candidates) === slot
}

// Lets an image on the clipboard (Ctrl+V after a screenshot or "Copy image") drop into a
// react-dropzone zone from anywhere on the page. Pass the `rootRef`/`inputRef` that
// `useDropzone` already returns.
export function usePasteToDropzone({
  rootRef,
  inputRef,
  disabled = false,
}: UsePasteToDropzoneOptions): UsePasteToDropzoneResult {
  const [slot] = useState<PasteSlot>(() => ({ rootRef, inputRef }))

  useEffect(() => {
    if (disabled) return

    const unregister = register(slot)
    const root = rootRef.current
    // The zone the user last touched wins, even after the pointer leaves, so they can hover a
    // zone, take the screenshot, and paste without keeping the mouse on it.
    const activate = () => {
      lastActive = slot
      emit()
    }
    root?.addEventListener("pointerenter", activate)
    root?.addEventListener("focusin", activate)

    return () => {
      root?.removeEventListener("pointerenter", activate)
      root?.removeEventListener("focusin", activate)
      unregister()
    }
  }, [disabled, slot, rootRef])

  const isPasteTarget = useSyncExternalStore(
    subscribe,
    () => isTarget(slot),
    () => false
  )

  return { isPasteTarget }
}
