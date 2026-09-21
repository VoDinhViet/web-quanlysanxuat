import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
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
import { deleteInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/delete-inventory-requisition.api"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"

type DeleteRequisitionDialogProps = {
  requisition: Pick<InventoryRequisition, "id" | "code">
  trigger: ReactElement
  onDeleted?: () => void
}

export function DeleteRequisitionDialog({
  requisition,
  trigger,
  onDeleted,
}: DeleteRequisitionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteRequisitionFn = useServerFn(deleteInventoryRequisition)

  const mutation = useMutation({
    mutationFn: () =>
      deleteRequisitionFn({
        data: { requisitionId: requisition.id },
      }),
    onSuccess: async () => {
      setOpen(false)
      toast.success(`Đã xoá phiếu lãnh vật tư "${requisition.code}".`)
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
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
            <Trash2 className="size-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá phiếu lãnh vật tư</AlertDialogTitle>
          <AlertDialogDescription>
            {`Bạn có chắc chắn muốn xoá phiếu lãnh vật tư "${requisition.code}"? Thao tác này sẽ xoá hoàn toàn phiếu nháp và không thể hoàn tác.`}
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
            {mutation.isPending ? "Đang xoá…" : "Xoá phiếu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
