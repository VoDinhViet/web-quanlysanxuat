import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePurchaseRequestItem } from "@/features/purchase-requests/api/server-functions/delete-purchase-request-item.api"

type DeletePurchaseRequestItemDialogProps = {
  purchaseRequestItemId: string
  itemName: string
  itemCode: string
  trigger: ReactNode
}

// `purchaseRequestId` is a route param, read directly via `useParams` rather than threaded down
// through Section → columns factory → this cell, same as PurchaseRequestItemNoteDialog.
export function DeletePurchaseRequestItemDialog({
  purchaseRequestItemId,
  itemName,
  itemCode,
  trigger,
}: DeletePurchaseRequestItemDialogProps) {
  const { purchaseRequestId } = useParams({
    from: "/(authed)/manage_/purchase-requests_/$purchaseRequestId",
  })
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteItemFn = useServerFn(deletePurchaseRequestItem)

  const mutation = useMutation({
    mutationFn: () =>
      deleteItemFn({ data: { purchaseRequestId, purchaseRequestItemId } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
    },
    onError: (error) => {
      setOpen(false)
      toast.error(error.message)
    },
  })

  return (
    <AlertDialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa dòng vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${itemName}" (${itemCode}) sẽ bị xóa khỏi đề xuất.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            isDisabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
