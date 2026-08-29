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
import { approveInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/approve-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type ApproveRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// PENDING_APPROVAL → APPROVED — chốt giữ hàng (Đã giữ), chưa đụng tồn kho. Backend re-check
// "Có thể lãnh"/SL BOM còn lại ngay tại bước này (E231/E232) vì tồn/BOM có thể đã đổi từ lúc
// lập phiếu tới lúc duyệt — dialog không tự tính trước, chỉ hiện lỗi backend trả về.
export function ApproveRequisitionDialog({
  detail,
  trigger,
}: ApproveRequisitionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approveInventoryRequisitionFn = useServerFn(approveInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      approveInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
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
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt phiếu lãnh vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${detail.code} sẽ chuyển sang "Đã duyệt" và giữ số lượng vật tư đã lãnh — chưa trừ tồn kho, chờ kho xuất.`}
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
