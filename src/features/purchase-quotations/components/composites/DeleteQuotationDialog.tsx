import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TrashBinTrash } from "@solar-icons/react"
import { toast } from "sonner"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/delete-purchase-quotation.api"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"

type DeleteQuotationDialogProps = {
  purchaseQuotation: Pick<PurchaseQuotationRow, "id" | "code">
  trigger: ReactElement
  onDeleted?: () => void
}

export function DeleteQuotationDialog({
  purchaseQuotation,
  trigger,
  onDeleted,
}: DeleteQuotationDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteQuotationFn = useServerFn(deletePurchaseQuotation)

  const mutation = useMutation({
    mutationFn: () =>
      deleteQuotationFn({
        data: { purchaseQuotationId: purchaseQuotation.id },
      }),
    onSuccess: async () => {
      setOpen(false)
      toast.success(`Đã xoá báo giá "${purchaseQuotation.code}".`)
      await queryClient.invalidateQueries({ queryKey: ["purchase-quotations"] })
      onDeleted?.()
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
          <AlertDialogTitle>Xoá báo giá</AlertDialogTitle>
          <AlertDialogDescription>
            {`Bạn có chắc chắn muốn xoá báo giá "${purchaseQuotation.code}"? Thao tác này sẽ xoá hoàn toàn báo giá và không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Đang xoá…" : "Xoá báo giá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
