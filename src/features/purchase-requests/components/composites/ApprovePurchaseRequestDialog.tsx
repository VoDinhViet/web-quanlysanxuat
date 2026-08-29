import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CircleCheck } from "lucide-react"
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
import { approvePurchaseRequest } from "@/features/purchase-requests/api/server-functions/approve-purchase-request.api"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type ApprovePurchaseRequestDialogProps = {
  purchaseRequest: PurchaseRequestDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → APPROVED (terminal) — director-level, needs purchase-requests:approve.
export function ApprovePurchaseRequestDialog({
  purchaseRequest,
  trigger,
}: ApprovePurchaseRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approvePurchaseRequestFn = useServerFn(approvePurchaseRequest)

  const mutation = useMutation({
    mutationFn: () =>
      approvePurchaseRequestFn({
        data: { purchaseRequestId: purchaseRequest.id },
      }),
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
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt đề xuất mua hàng này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Đề xuất ${purchaseRequest.code} sẽ chuyển sang trạng thái "Đã duyệt".`}
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
            {mutation.isPending ? "Đang xử lý..." : "Duyệt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
