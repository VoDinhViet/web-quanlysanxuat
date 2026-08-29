import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ReasonDialogProps = {
  trigger: ReactNode
  className?: string
  // Render-prop rather than a plain node: the form needs the dialog's own `close` to run after
  // its mutation succeeds. Radix unmounts DialogContent while closed, so the form (and its
  // mutation/field state) re-mounts fresh every time the dialog opens — no manual
  // `mutation.reset()` needed, unlike ConfirmActionDialog.
  children: (close: () => void) => ReactNode
}

// The shell for a confirm dialog that needs an input — currently just a required reason
// textarea (a rejection reason), but the shape (Dialog, not AlertDialog, so it can hold a real
// form) generalizes to any single-field confirm. See RejectRequisitionDialog.tsx for the one
// call site so far, and ConfirmActionDialog.tsx for the plain-confirm sibling.
export function ReasonDialog({
  trigger,
  className,
  children,
}: ReasonDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", className)}>
        {children(() => setOpen(false))}
      </DialogContent>
    </Dialog>
  )
}
