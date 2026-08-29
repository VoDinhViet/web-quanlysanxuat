import { Info, Lightbulb } from "lucide-react"

import {
  InventoryReceiptStatus,
  inventoryReceiptStatusDescriptions,
} from "@/lib/types/inventory-receipt.type"
import { InventoryReceiptStatusBadge } from "@/features/inventory-receipts/components/primitives/InventoryReceiptBadges"

const statuses = Object.values(InventoryReceiptStatus)

export function InventoryReceiptLegend() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5 lg:grid-cols-2">
      {/* Ghi chú trạng thái */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="size-4 text-primary" />
          <span>Ghi chú trạng thái:</span>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {statuses.map((status) => (
            <li key={status} className="flex items-start gap-2">
              <InventoryReceiptStatusBadge
                status={status}
                className="mt-0.5 shrink-0 text-[10px]"
              />
              <span className="text-muted-foreground">
                {inventoryReceiptStatusDescriptions[status]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div className="space-y-2.5 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Lightbulb className="size-4 text-amber-500" />
          <span>Tips:</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p>
            • Nhấn icon xem chi tiết (mắt) để xem thông tin chi tiết phiếu nhập
            kho.
          </p>
          <p>
            • Chỉ phiếu ở trạng thái{" "}
            <strong className="font-medium text-foreground">Nháp</strong> mới
            cho phép sửa hoặc xóa.
          </p>
          <p>
            • Đã hỗ trợ tính năng{" "}
            <strong className="font-medium text-foreground">
              In phiếu nhập kho
            </strong>{" "}
            trực tiếp từ danh sách và trang chi tiết.
          </p>
        </div>
      </div>
    </div>
  )
}
