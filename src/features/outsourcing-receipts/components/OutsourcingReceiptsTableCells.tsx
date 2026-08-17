import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"
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
      <IconButton
        label="Xem chi tiết"
        asChild
        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
      >
        <Link
          to="/manage/outsourcing-receipts/$outsourcingReceiptId"
          params={{ outsourcingReceiptId: outsourcingReceipt.id }}
        >
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
    </div>
  )
}
