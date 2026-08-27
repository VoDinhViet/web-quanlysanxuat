import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { UpdateOperationForm } from "@/features/operations/components/UpdateOperationForm"
import type { OperationDetail } from "@/lib/types/operation.type"

type UpdateOperationDialogProps = {
  operation: OperationDetail
  trigger: ReactNode
}

export function UpdateOperationDialog({
  operation,
  trigger,
}: UpdateOperationDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {/* Radix unmounts content while closed, so the form re-mounts and re-seeds from
            `operation` fresh on every open. */}
        <UpdateOperationForm
          operation={operation}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
