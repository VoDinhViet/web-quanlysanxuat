import { Link } from "@tanstack/react-router"
import { Notes } from "@solar-icons/react"

import type {
  PurchaseChainNoteItem,
  PurchaseChainNotes,
} from "@/lib/types/purchase-chain-notes.type"

type RelatedNotesCardProps = {
  data: PurchaseChainNotes
  // Ẩn đúng 1 dòng tự tham chiếu chứng từ đang xem — note của chính nó đã hiện ở nơi khác trên
  // trang (header/MetaField riêng của từng feature), không lặp lại ở đây.
  excludeId?: string
}

type Group = {
  key: string
  label: string
  items: PurchaseChainNoteItem[]
  toRoute: string
  paramName: string
}

// Component dùng chung cho cả 4 trang chi tiết mua hàng (ĐXMH/Báo giá/Đơn mua/Phiếu kho) — biết
// sẵn cả 4 route đích vì đây là widget riêng cho đúng 1 tính năng (ghi chú xuyên chuỗi mua hàng),
// không phải danh sách tổng quát, nên không cần nhận route qua props.
export function RelatedNotesCard({ data, excludeId }: RelatedNotesCardProps) {
  const groups: Group[] = [
    {
      key: "purchaseRequests",
      label: "Đề xuất mua hàng",
      items: data.purchaseRequests,
      toRoute: "/manage/purchase-requests/$purchaseRequestId",
      paramName: "purchaseRequestId",
    },
    {
      key: "quotations",
      label: "Báo giá NCC",
      items: data.quotations,
      toRoute: "/manage/purchase-quotations/$purchaseQuotationId",
      paramName: "purchaseQuotationId",
    },
    {
      key: "purchaseOrders",
      label: "Đơn mua hàng",
      items: data.purchaseOrders,
      toRoute: "/manage/purchase-orders/$purchaseOrderId",
      paramName: "purchaseOrderId",
    },
    {
      key: "inventoryReceipts",
      label: "Phiếu nhập kho",
      items: data.inventoryReceipts,
      toRoute: "/manage/inventory-receipts/$inventoryReceiptId",
      paramName: "inventoryReceiptId",
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.id !== excludeId),
    }))
    .filter((group) => group.items.length > 0)

  if (groups.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Notes className="size-4 text-muted-foreground" />
        Ghi chú liên quan
      </div>
      <div className="divide-y divide-border/60">
        {groups.map((group) => (
          <div key={group.key} className="px-4 py-3 sm:px-5">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              {group.label}
            </p>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5">
                  <Link
                    to={group.toRoute}
                    params={{ [group.paramName]: item.id }}
                    className="font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {item.code}
                  </Link>
                  <p className="text-xs text-muted-foreground italic">
                    {item.note ?? "Chưa có ghi chú"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
