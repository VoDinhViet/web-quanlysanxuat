import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateUnitForm } from "@/features/units/components/CreateUnitForm"

type CreateUnitDialogProps = {
  trigger: ReactNode
}

export function CreateUnitDialog({ trigger }: CreateUnitDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {/* Radix unmounts content while closed, so the form (and its draft-restore effect)
            re-mounts fresh on every open. */}
        <CreateUnitForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
