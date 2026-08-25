import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { UpdateUnitForm } from "@/features/units/components/UpdateUnitForm"
import type { UnitDetail } from "@/lib/types/unit.type"

type UpdateUnitDialogProps = {
  unit: UnitDetail
  trigger: ReactNode
}

export function UpdateUnitDialog({ unit, trigger }: UpdateUnitDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {/* Radix unmounts content while closed, so the form re-mounts and re-seeds from
            `unit` fresh on every open. */}
        <UpdateUnitForm
          unit={unit}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
