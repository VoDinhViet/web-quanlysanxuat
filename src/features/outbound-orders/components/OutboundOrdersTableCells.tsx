import { Link } from "@tanstack/react-router"
import { Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { DeleteOutboundOrderDialog } from "@/features/outbound-orders/components/DeleteOutboundOrderDialog"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"

// "Sửa"/"Xóa" chỉ hoạt động khi order.status === DRAFT (BE gate E259/E258, BUG-090) — không có
// route /update riêng, "Sửa" là Link sang chính trang chi tiết với ?mode=edit (edit-inline). Dòng
// khác DRAFT giữ DisabledAction. "In phiếu DO" vẫn DisabledAction ở mọi trạng thái — không liên
// quan BUG-090, BE chưa có tính năng in phiếu.
export function OutboundOrderActionsCell({ order }: { order: OutboundOrder }) {
  const isDraft = order.status === OutboundOrderStatus.DRAFT

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-7 border-primary/20 text-primary hover:bg-primary/10"
        title="Xem chi tiết DO"
        asChild
      >
        <Link
          to="/manage/outbound-orders/$outboundOrderId"
          params={{ outboundOrderId: order.id }}
          search={{ mode: "view" }}
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>

      {isDraft ? (
        <PermissionGate permission="outbound:update">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            title="Chỉnh sửa DO"
            asChild
          >
            <Link
              to="/manage/outbound-orders/$outboundOrderId"
              params={{ outboundOrderId: order.id }}
              search={{ mode: "edit" }}
            >
              <Pencil className="size-3.5" />
            </Link>
          </Button>
        </PermissionGate>
      ) : (
        <DisabledAction
          label="Chỉnh sửa DO"
          hint="chỉ sửa được khi phiếu ở trạng thái Nháp"
        >
          <Pencil className="size-3.5" />
        </DisabledAction>
      )}

      <DisabledAction label="In phiếu DO" hint="chưa có tính năng in phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>

      {isDraft ? (
        <PermissionGate permission="outbound:delete">
          <DeleteOutboundOrderDialog
            order={order}
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="size-7 border-destructive/20 text-destructive hover:bg-destructive/10"
                title="Xóa DO"
              >
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
        </PermissionGate>
      ) : (
        <DisabledAction
          label="Xóa DO"
          hint="chỉ xóa được khi phiếu ở trạng thái Nháp"
        >
          <Trash2 className="size-3.5" />
        </DisabledAction>
      )}
    </div>
  )
}
