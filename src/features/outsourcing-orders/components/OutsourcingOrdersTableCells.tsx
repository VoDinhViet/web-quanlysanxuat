import { Link } from "@tanstack/react-router"
import { EllipsisVertical, Eye, Printer } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"
import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderActionsCellProps = {
  outsourcingOrder: OutsourcingOrder
}

// "Xem chi tiết" dẫn tới trang chi tiết thật (post/cancel/xoá nằm ở đó, không phải hành động ở
// dòng danh sách — cùng idiom OutsourcingReceiptActionsCell.tsx). In phiếu và Sửa/Nhân bản chưa
// có tính năng, giữ DisabledAction.
export function OutsourcingOrderActionsCell({
  outsourcingOrder,
}: OutsourcingOrderActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton
        label="Xem chi tiết"
        asChild
        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
      >
        <Link
          to="/manage/outsourcing-orders/$outsourcingOrderId"
          params={{ outsourcingOrderId: outsourcingOrder.id }}
        >
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
      <DisabledAction label="In phiếu xuất" hint="chưa có tính năng in phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>
      <DisabledAction label="Khác" hint="Sửa, Nhân bản — tính năng sắp có">
        <EllipsisVertical className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
