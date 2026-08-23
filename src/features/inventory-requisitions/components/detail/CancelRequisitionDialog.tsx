import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CircleX } from "lucide-react"
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
import { cancelInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/cancel-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type CancelRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// Mọi trạng thái trừ ISSUED/CANCELLED → CANCELLED — điểm cuối, không đảo được. Cùng khuôn
// "Hủy phiếu" của InventoryReceiptDetailActions/InventoryIssueActionsCell.
export function CancelRequisitionDialog({
  detail,
  trigger,
}: CancelRequisitionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const cancelInventoryRequisitionFn = useServerFn(cancelInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      cancelInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleX />
          </AlertDialogMedia>
          <AlertDialogTitle>Hủy phiếu lãnh vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${detail.code} sẽ bị hủy. Hành động này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Hủy phiếu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
