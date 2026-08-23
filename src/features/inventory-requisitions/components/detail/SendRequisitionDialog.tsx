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
import { sendInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/send-inventory-requisition.api"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type SendRequisitionDialogProps = {
  detail: InventoryRequisitionDetail
  trigger: ReactNode
}

// DRAFT/REJECTED → PENDING_APPROVAL — cùng khuôn SendQuotationDialog.tsx.
export function SendRequisitionDialog({
  detail,
  trigger,
}: SendRequisitionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const sendInventoryRequisitionFn = useServerFn(sendInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      sendInventoryRequisitionFn({ data: { requisitionId: detail.id } }),
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
            <Send />
          </AlertDialogMedia>
          <AlertDialogTitle>Gửi duyệt phiếu lãnh vật tư này?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Phiếu ${detail.code} sẽ chuyển sang trạng thái "Chờ duyệt" và không sửa được nữa cho tới khi có quyết định.`}
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
