import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Trash2 } from "lucide-react"
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
import { deletePurchaseRequest } from "@/features/purchase-requests/api/server-functions/delete-purchase-request.api"
import type { PurchaseRequestRef } from "@/lib/types/purchase-request.type"

type DeletePurchaseRequestDialogProps = {
  purchaseRequest: PurchaseRequestRef
  trigger: ReactElement
}

// DRAFT/REJECTED only (backend E114 otherwise) — needs purchase-requests:delete. Xóa luôn mọi dòng
// vật tư, không khôi phục được, nên xong thì về danh sách.
export function DeletePurchaseRequestDialog({
  purchaseRequest,
  trigger,
}: DeletePurchaseRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deletePurchaseRequestFn = useServerFn(deletePurchaseRequest)

  const mutation = useMutation({
    mutationFn: () =>
      deletePurchaseRequestFn({
        data: { purchaseRequestId: purchaseRequest.id },
      }),
    onSuccess: async () => {
      setOpen(false)
      toast.success(`Đã xóa đề xuất ${purchaseRequest.code}`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
      await navigate({
        to: "/manage/purchase-requests",
        search: { page: 1, limit: 10 },
      })
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
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa đề xuất mua hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Đề xuất ${purchaseRequest.code} và toàn bộ dòng vật tư sẽ bị xóa, không khôi phục được.`}
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
