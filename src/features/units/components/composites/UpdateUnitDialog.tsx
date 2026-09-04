import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { UpdateUnitForm } from "@/features/units/components/composites/UpdateUnitForm"
import type { UnitDetail } from "@/lib/types/unit.type"

type UpdateUnitDialogProps = {
  unit: UnitDetail
  trigger: ReactNode
}

export function UpdateUnitDialog({ unit, trigger }: UpdateUnitDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts and re-seeds
            from `unit` fresh on every open. */}
        <UpdateUnitForm
          unit={unit}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}
