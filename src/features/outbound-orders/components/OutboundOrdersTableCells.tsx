import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { mockDeleteOutboundOrder } from "@/features/outbound-orders/mock/outbound-orders.mock"
import { OutboundOrderPrintDialog } from "@/features/outbound-orders/components/detail/OutboundOrderPrintDialog"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"

export function OutboundOrderActionsCell({
  order,
}: {
  order: OutboundOrder
}) {
  const [printOpen, setPrintOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockDeleteOutboundOrder(order.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["outbound-orders", "list"],
      })
      setDeleteOpen(false)
    },
  })

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        {/* Eye icon: Quick view / Detail link */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-primary border-primary/20 hover:bg-primary/10"
          title="Xem chi tiết DO"
          asChild
        >
          <Link
            to="/manage/outbound-orders/$outboundOrderId"
            params={{ outboundOrderId: order.id }}
          >
            <Eye className="size-3.5" />
          </Link>
        </Button>

        {/* Pencil icon: Edit action */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-blue-600 border-blue-600/20 hover:bg-blue-50 dark:hover:bg-blue-950"
          title="Chỉnh sửa DO"
          asChild
        >
          <Link
            to="/manage/outbound-orders/$outboundOrderId"
            params={{ outboundOrderId: order.id }}
          >
            <Pencil className="size-3.5" />
          </Link>
        </Button>

        {/* Printer icon: Print action */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="In phiếu DO"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-3.5" />
        </Button>

        {/* Trash icon: Delete action */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-destructive border-destructive/20 hover:bg-destructive/10"
          title="Xóa DO"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Print Dialog */}
      <OutboundOrderPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        orderId={order.id}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa yêu cầu giao hàng (DO)</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa đơn giao hàng{" "}
              <span className="font-mono font-semibold text-foreground">
                {order.code}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa…" : "Xóa DO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
