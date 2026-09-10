import { Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteOutboundOrderDialog } from "@/features/outbound-orders/components/composites/DeleteOutboundOrderDialog"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"

// "Sửa"/"Xóa" chỉ hoạt động khi order.status === DRAFT (BE gate E259/E258, BUG-090) — không có
// route /update riêng, "Sửa" là Link sang chính trang chi tiết với ?mode=edit (edit-inline). Dòng
// khác DRAFT giữ DisabledAction. "In phiếu DO" vẫn DisabledAction ở mọi trạng thái — không liên
// quan BUG-090, BE chưa có tính năng in phiếu.
export function OutboundOrderActionsCell({ order }: { order: OutboundOrder }) {
  const isDraft = order.status === OutboundOrderStatus.DRAFT

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/outbound-orders/$outboundOrderId"
              params={{ outboundOrderId: order.id }}
              search={{ mode: "view" }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết DO"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết DO</TooltipContent>
      </Tooltip>

      {isDraft ? (
        <PermissionGate permission="outbound:update">
          <Tooltip>
            <TooltipTrigger
              render={
                <LinkButton
                  to="/manage/outbound-orders/$outboundOrderId"
                  params={{ outboundOrderId: order.id }}
                  search={{ mode: "edit" }}
                  variant="outline"
                  size="icon-sm"
                  aria-label="Chỉnh sửa DO"
                  className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Pencil className="size-3.5" />
                </LinkButton>
              }
            />
            <TooltipContent>Chỉnh sửa DO</TooltipContent>
          </Tooltip>
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
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Xóa DO"
                      className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Xóa DO</TooltipContent>
              </Tooltip>
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
