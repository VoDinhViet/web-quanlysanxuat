import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { UpdateDepartmentForm } from "@/features/departments/components/composites/UpdateDepartmentForm"
import type { Department } from "@/lib/types/department.type"

type UpdateDepartmentDialogProps = {
  department: Department
  trigger: ReactElement
}

export function UpdateDepartmentDialog({
  department,
  trigger,
}: UpdateDepartmentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts and re-seeds
            from `department` fresh on every open. */}
        <UpdateDepartmentForm
          department={department}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
