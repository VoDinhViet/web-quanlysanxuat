import { PackageSearch } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { createColumnHelper } from "@tanstack/react-table"
import type {
  PaymentRequestDetail,
  PaymentRequestItem,
} from "@/lib/types/payment-request.type"

const col = createColumnHelper<PaymentRequestItem>()
const numberFmt = new Intl.NumberFormat("vi-VN")

const itemColumns = [
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.accessor("materialCode", {
    header: "Mã vật tư",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
  }),

  col.accessor("materialName", {
    header: "Tên vật tư / hàng hóa",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor("unit", {
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center",
    },
  }),

  col.accessor("orderedQty", {
    header: "SL đặt mua",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("receivedQty", {
    header: "SL đã nhập (OK)",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("unitPrice", {
    header: "Đơn giá (VND)",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("lineTotal", {
    header: "Thành tiền (VND)",
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right font-semibold tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),
]

type PaymentRequestItemsSectionProps = {
  detail: PaymentRequestDetail
}

// Section header + bare DataTable — no pagination; PO line counts are small.
// Same "tiêu đề dải" idiom as PurchaseOrderItemsSection.tsx.
export function PaymentRequestItemsSection({
  detail,
}: PaymentRequestItemsSectionProps) {
  const totalAmount = detail.items.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách vật tư / hàng hóa
      </h3>

      <DataTable
        rows={detail.items}
        columns={itemColumns}
        isPending={false}
        bare
        emptyState={
          <TableEmptyState
            icon={PackageSearch}
            title="Chưa có vật tư nào"
            description="Yêu cầu thanh toán này chưa có dòng vật tư nào."
          />
        }
      />

      {/* Footer total row */}
      {detail.items.length > 0 && (
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tổng cộng
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {numberFmt.format(totalAmount)} VND
          </span>
        </div>
      )}
    </div>
  )
}
