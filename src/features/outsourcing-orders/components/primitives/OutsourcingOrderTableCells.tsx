import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderActionsCellProps = {
  outsourcingOrder: OutsourcingOrder
}

// "Xem chi tiết" dẫn tới trang chi tiết thật (post/cancel/xoá nằm ở đó, không phải hành động ở
// dòng danh sách — cùng idiom OutsourcingReceiptActionsCell.tsx).
export function OutsourcingOrderActionsCell({
  outsourcingOrder,
}: OutsourcingOrderActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/outsourcing-orders/$outsourcingOrderId"
              params={{ outsourcingOrderId: outsourcingOrder.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="text-muted-foreground hover:border-border hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>
    </div>
  )
}
