import { Link } from "@tanstack/react-router"
import { Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"

// BE outbound-orders hiện chỉ có list/detail/items/create (luôn DRAFT) — chưa có API sửa/in
// phiếu/xóa, nên 3 thao tác đó dùng DisabledAction (disabled + tooltip) thay vì hành vi mock cũ.
// Chỉ "Xem chi tiết" là link thật.
export function OutboundOrderActionsCell({ order }: { order: OutboundOrder }) {
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
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>

      <DisabledAction label="Chỉnh sửa DO" hint="chưa có tính năng sửa phiếu">
        <Pencil className="size-3.5" />
      </DisabledAction>

      <DisabledAction label="In phiếu DO" hint="chưa có tính năng in phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>

      <DisabledAction label="Xóa DO" hint="chưa có tính năng xóa phiếu">
        <Trash2 className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
