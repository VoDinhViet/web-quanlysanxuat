import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateOperationForm } from "@/features/operations/components/composites/CreateOperationForm"

type CreateOperationDialogProps = {
  trigger: ReactNode
}

export function CreateOperationDialog({ trigger }: CreateOperationDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {/* Radix unmounts content while closed, so the form (and its draft-restore effect)
            re-mounts fresh on every open. */}
        <CreateOperationForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
