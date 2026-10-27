import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateItemCategoryForm } from "@/features/item-categories/components/composites/CreateItemCategoryForm"

type CreateItemCategoryDialogProps = {
  trigger: ReactElement
}

export function CreateItemCategoryDialog({
  trigger,
}: CreateItemCategoryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts fresh on every open. */}
        <CreateItemCategoryForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
