import { useState } from "react"
import type { ReactElement } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { UpdateItemCategoryForm } from "@/features/item-categories/components/composites/UpdateItemCategoryForm"
import type { ItemCategory } from "@/lib/types/item-category.type"

type UpdateItemCategoryDialogProps = {
  itemCategory: ItemCategory
  trigger: ReactElement
}

export function UpdateItemCategoryDialog({
  itemCategory,
  trigger,
}: UpdateItemCategoryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {/* The dialog unmounts content while closed, so the form re-mounts and re-seeds from
            `itemCategory` fresh on every open. */}
        <UpdateItemCategoryForm
          itemCategory={itemCategory}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
