import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateUnitForm } from "@/features/units/components/composites/CreateUnitForm"

type CreateUnitDialogProps = {
  trigger: ReactElement
}

export function CreateUnitDialog({ trigger }: CreateUnitDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form (and its draft-restore
            effect) re-mounts fresh on every open. */}
        <CreateUnitForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
