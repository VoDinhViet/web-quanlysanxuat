import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TrashBinTrash } from "@solar-icons/react"
import { toast } from "sonner"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteItemCategory } from "@/features/item-categories/api/server-functions/delete-item-category.api"
import type { ItemCategoryRef } from "@/lib/types/item-category.type"

type DeleteItemCategoryDialogProps = {
  itemCategory: ItemCategoryRef
  trigger: ReactElement
}

export function DeleteItemCategoryDialog({
  itemCategory,
  trigger,
}: DeleteItemCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteItemCategoryFn = useServerFn(deleteItemCategory)

  const mutation = useMutation({
    mutationFn: () =>
      deleteItemCategoryFn({ data: { itemCategoryId: itemCategory.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["item-categories"] })
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TrashBinTrash />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa nhóm vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${itemCategory.name}" (${itemCategory.code}) sẽ bị xóa khỏi danh mục nhóm vật tư. Nhóm đang được vật tư sử dụng sẽ không xóa được.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
