import { useState } from "react"
import type { ComponentType, ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ConfirmActionDialogProps = {
  trigger: ReactNode
  icon: ComponentType
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  pendingLabel?: string
  destructive?: boolean
  // Returns a Promise so the dialog knows when to close itself:
  // `async () => { await mutation.mutateAsync(...); void queryClient.invalidateQueries(...) }`
  // — invalidation stays un-awaited so the dialog closes as soon as the action itself
  // succeeds, not after its background refetch too. `mutation.error`/`isPending` stay owned by
  // the caller's own useMutation, same as its query key.
  onConfirm: () => Promise<unknown>
  isPending: boolean
  error?: string | null
  // Fires on every open/close transition, in addition to the dialog's own open state — a
  // caller that wants to `mutation.reset()` a stale error on reopen hooks in here.
  onOpenChange?: (open: boolean) => void
}

// The 1-action confirm shell every "Duyệt/Hủy/Xuất kho/Gửi duyệt phiếu này?" dialog in the repo
// reuses — icon, title, description, an error line, and a cancel/confirm footer. Owns its own
// open state (kills the near-identical `useState(false)` + reset-on-reopen boilerplate every
// call site used to hand-roll); the mutation itself — and what it invalidates — stays at the
// call site. See ApproveRequisitionDialog.tsx for one, and ReasonDialog.tsx for the sibling
// shell used when the action needs an input (a rejection reason) rather than a plain confirm.
export function ConfirmActionDialog({
  trigger,
  icon: IconComponent,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  pendingLabel = "Đang xử lý...",
  destructive,
  onConfirm,
  isPending,
  error,
  onOpenChange,
}: ConfirmActionDialogProps) {
  const [open, setOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  async function handleConfirm() {
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // Stays open — `error` (the caller's own mutation.error) already reflects why.
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconComponent />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : undefined}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
