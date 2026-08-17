import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, CircleX, Printer, Trash2 } from "lucide-react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cancelOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/cancel-outsourcing-order.api"
import { deleteOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/delete-outsourcing-order.api"
import { postOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/post-outsourcing-order.api"
import { InventoryDocumentStatus } from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderDetailActionsProps = {
  detail: OutsourcingOrderDetail
}

type ConfirmAction = "post" | "cancel" | "delete" | null

// "Xác nhận đã gửi" (DRAFT → POSTED, trừ tồn kho xuất theo từng dòng), "Hủy phiếu" (đảo bút toán
// nếu đã POSTED, chặn nếu còn OS-IN chưa hủy) và "Xoá phiếu" (chỉ khi DRAFT, xoá hẳn khỏi DB)
// share một dialog xác nhận, cùng ConfirmAction pattern OutsourcingReceiptDetailActions.tsx.
export function OutsourcingOrderDetailActions({
  detail,
}: OutsourcingOrderDetailActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const postOutsourcingOrderFn = useServerFn(postOutsourcingOrder)
  const cancelOutsourcingOrderFn = useServerFn(cancelOutsourcingOrder)
  const deleteOutsourcingOrderFn = useServerFn(deleteOutsourcingOrder)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })

  const postMutation = useMutation({
    mutationFn: () =>
      postOutsourcingOrderFn({ data: { outsourcingOrderId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelOutsourcingOrderFn({ data: { outsourcingOrderId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      setConfirmAction(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteOutsourcingOrderFn({ data: { outsourcingOrderId: detail.id } }),
    onSuccess: async () => {
      await invalidate()
      await navigate({
        to: "/manage/outsourcing-orders",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const isDraft = detail.status === InventoryDocumentStatus.DRAFT
  const isCancelled = detail.status === InventoryDocumentStatus.CANCELLED

  const activeMutation =
    confirmAction === "post"
      ? postMutation
      : confirmAction === "delete"
        ? deleteMutation
        : cancelMutation

  const closeConfirm = (open: boolean) => {
    if (!open) {
      setConfirmAction(null)
      postMutation.reset()
      cancelMutation.reset()
      deleteMutation.reset()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {isDraft && (
        <PermissionGate permission="outsourcing:update">
          <Button type="button" onClick={() => setConfirmAction("post")}>
            <CircleCheck className="size-4" />
            Xác nhận đã gửi
          </Button>
        </PermissionGate>
      )}

      {!isCancelled && (
        <PermissionGate permission="outsourcing:update">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive"
            onClick={() => setConfirmAction("cancel")}
          >
            <CircleX className="size-4" />
            Hủy phiếu
          </Button>
        </PermissionGate>
      )}

      {isDraft && (
        <PermissionGate permission="outsourcing:delete">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmAction("delete")}
          >
            <Trash2 className="size-4" />
            Xoá phiếu
          </Button>
        </PermissionGate>
      )}

      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        In phiếu
      </Button>

      {confirmAction && (
        <Dialog open onOpenChange={closeConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "post"
                  ? "Xác nhận đã gửi hàng"
                  : confirmAction === "delete"
                    ? "Xoá phiếu gia công ngoài"
                    : "Hủy phiếu gia công ngoài"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "post" ? (
                  <>
                    Xác nhận phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    sẽ trừ tồn kho xuất theo từng dòng. Sau khi xác nhận, phiếu
                    không thể sửa được nữa.
                  </>
                ) : confirmAction === "delete" ? (
                  <>
                    Xoá hẳn phiếu nháp{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>
                    , không thể khôi phục.
                  </>
                ) : detail.status === InventoryDocumentStatus.POSTED ? (
                  <>
                    Phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>{" "}
                    đã trừ tồn kho xuất — hủy sẽ đảo ngược bút toán và cộng lại
                    tồn kho đã trừ. Nếu phiếu đã có OS-IN (nhận hàng) liên kết
                    chưa hủy, thao tác sẽ thất bại.
                  </>
                ) : (
                  <>
                    Bạn chắc chắn muốn hủy phiếu{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {detail.code}
                    </span>
                    ? Phiếu chưa trừ tồn nên không ảnh hưởng số liệu.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {activeMutation.error && (
              <p className="text-sm text-destructive">
                {activeMutation.error.message}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => closeConfirm(false)}
                disabled={activeMutation.isPending}
              >
                Đóng
              </Button>
              <Button
                variant={confirmAction === "post" ? "default" : "destructive"}
                onClick={() => {
                  if (confirmAction === "post") {
                    postMutation.mutate()
                  } else if (confirmAction === "delete") {
                    deleteMutation.mutate()
                  } else {
                    cancelMutation.mutate()
                  }
                }}
                disabled={activeMutation.isPending}
              >
                {activeMutation.isPending ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
