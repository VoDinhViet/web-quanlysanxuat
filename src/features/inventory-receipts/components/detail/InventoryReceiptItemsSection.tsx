import { PackageSearch } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/DataTable"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import type {
  InventoryReceiptDetail,
  InventoryReceiptItem,
} from "@/lib/types/inventory-receipt.type"

const col = createColumnHelper<InventoryReceiptItem>()
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
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
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

  col.accessor("docQuantity", {
    header: "SL chứng từ",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("actualQuantity", {
    header: "SL thực nhập",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("passedQuantity", {
    header: "SL đạt (OK)",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-emerald-600 font-semibold",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("failedQuantity", {
    header: "SL lỗi (NG)",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-rose-600 font-semibold",
    },
    cell: ({ getValue }) =>
      getValue() > 0 ? numberFmt.format(getValue()) : "0",
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
]

type InventoryReceiptItemsSectionProps = {
  detail: InventoryReceiptDetail
}

export function InventoryReceiptItemsSection({
  detail,
}: InventoryReceiptItemsSectionProps) {
  const totalActual = detail.items.reduce(
    (sum, item) => sum + item.actualQuantity,
    0
  )
  const totalPassed = detail.items.reduce(
    (sum, item) => sum + item.passedQuantity,
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách vật tư nhập kho
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
            description="Phiếu nhập kho này chưa có dòng vật tư nào."
          />
        }
      />

      {detail.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wide">
              Tổng SL thực nhập:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalActual)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wide">
              Tổng SL Đạt (OK):
            </span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              {numberFmt.format(totalPassed)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
