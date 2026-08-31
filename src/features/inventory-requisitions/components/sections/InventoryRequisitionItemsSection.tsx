import { PackageSearch } from "lucide-react"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import type {
  InventoryRequisitionDetail,
  InventoryRequisitionItem,
} from "@/lib/types/inventory-requisition.type"

const col = createColumnHelper<
  typeof appTableFeatures,
  InventoryRequisitionItem
>()
const numberFmt = new Intl.NumberFormat("vi-VN")

// "6 số" (SL BOM/Đã lãnh/Tồn/Đã giữ/Có thể lãnh/Khả dụng) — snapshot đọc-thời-điểm từ backend, xem
// docs/domains/inventory.md mục "Phiếu lãnh vật tư". bomQuantity/issuedQuantity null khi phiếu
// type = OTHER (không gắn Job).
const itemColumns = col.columns([
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.accessor("item.code", {
    header: "Mã vật tư",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
    ),
  }),

  col.accessor("item.name", {
    header: "Tên vật tư",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor("item.unit.name", {
    header: "ĐVT",
    meta: {
      headerClassName: "w-16",
      cellClassName: "text-muted-foreground",
    },
  }),

  col.accessor("quantity", {
    header: "SL lãnh",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("bomQuantity", {
    header: "SL BOM",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value !== null ? numberFmt.format(value) : "—"
    },
  }),

  col.accessor("issuedQuantity", {
    header: "Đã lãnh",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value !== null ? numberFmt.format(value) : "—"
    },
  }),

  col.accessor("onHand", {
    header: "Tồn",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("reservedQuantity", {
    header: "Đã giữ",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("issuableQuantity", {
    header: "Có thể lãnh",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("availableQuantity", {
    header: "Khả dụng",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
])

type InventoryRequisitionItemsSectionProps = {
  detail: InventoryRequisitionDetail
}

export function InventoryRequisitionItemsSection({
  detail,
}: InventoryRequisitionItemsSectionProps) {
  const table = useTable({
    data: detail.items,
    columns: itemColumns,
    features: appTableFeatures,
  })

  const totalQuantity = detail.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách vật tư lãnh
      </h3>

      {detail.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có vật tư nào"
          description="Phiếu lãnh vật tư này chưa có dòng vật tư nào."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.headerClassName}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {detail.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng SL lãnh:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalQuantity)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
