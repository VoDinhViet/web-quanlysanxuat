import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { UpdatePositionForm } from "@/features/departments/components/composites/UpdatePositionForm"
import type { Position } from "@/lib/types/position.type"

type UpdatePositionDialogProps = {
  position: Position
  trigger: ReactElement
}

export function UpdatePositionDialog({
  position,
  trigger,
}: UpdatePositionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts and re-seeds
            from `position` fresh on every open. */}
        <UpdatePositionForm
          position={position}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
