import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Send } from "lucide-react"
import type { ReactNode } from "react"

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
import { sendPurchaseRequest } from "@/features/purchase-requests/api/server-functions/send-purchase-request.api"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type SendPurchaseRequestDialogProps = {
  detail: PurchaseRequestDetail
  trigger: ReactNode
}

// DRAFT → PENDING_APPROVAL — needs purchase-requests:update (same permission as any edit; the
// submitter can't also be the approver, see PurchaseRequestApprovalActions.tsx).
export function SendPurchaseRequestDialog({
  detail,
  trigger,
}: SendPurchaseRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const sendPurchaseRequestFn = useServerFn(sendPurchaseRequest)

  const mutation = useMutation({
    mutationFn: () =>
      sendPurchaseRequestFn({ data: { purchaseRequestId: detail.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // A previous failure shouldn't greet the user on reopen.
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Send />
          </AlertDialogMedia>
          <AlertDialogTitle>Gửi duyệt đề xuất mua hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Đề xuất ${detail.code} sẽ chuyển sang trạng thái "Chờ duyệt" và chờ Giám đốc duyệt.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Gửi duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
