import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import type { OutsourcingReceipt } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptActionsCellProps = {
  outsourcingReceipt: OutsourcingReceipt
}

// Chỉ có "Xem chi tiết" — module chưa có API sửa/xoá/in riêng (post/cancel nằm ở trang chi tiết,
// không phải hành động ở dòng danh sách).
export function OutsourcingReceiptActionsCell({
  outsourcingReceipt,
}: OutsourcingReceiptActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <TooltipTrigger>
        <LinkButton
          to="/manage/outsourcing-receipts/$outsourcingReceiptId"
          params={{ outsourcingReceiptId: outsourcingReceipt.id }}
          variant="outline"
          size="icon-sm"
          aria-label="Xem chi tiết"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <Eye className="size-3.5" />
        </LinkButton>
        <Tooltip>Xem chi tiết</Tooltip>
      </TooltipTrigger>
    </div>
  )
}
