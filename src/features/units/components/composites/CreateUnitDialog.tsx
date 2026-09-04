import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { CreateUnitForm } from "@/features/units/components/composites/CreateUnitForm"

type CreateUnitDialogProps = {
  trigger: ReactNode
}

export function CreateUnitDialog({ trigger }: CreateUnitDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form (and its draft-restore
            effect) re-mounts fresh on every open. */}
        <CreateUnitForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}
