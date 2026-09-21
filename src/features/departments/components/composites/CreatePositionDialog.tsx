import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreatePositionForm } from "@/features/departments/components/composites/CreatePositionForm"

type CreatePositionDialogProps = {
  departmentId: string
  trigger: ReactElement
}

export function CreatePositionDialog({
  departmentId,
  trigger,
}: CreatePositionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts fresh on every open. */}
        <CreatePositionForm
          departmentId={departmentId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
