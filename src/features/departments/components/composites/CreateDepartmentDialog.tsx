import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateDepartmentForm } from "@/features/departments/components/composites/CreateDepartmentForm"

type CreateDepartmentDialogProps = {
  trigger: ReactElement
}

export function CreateDepartmentDialog({
  trigger,
}: CreateDepartmentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts fresh on every open. */}
        <CreateDepartmentForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
