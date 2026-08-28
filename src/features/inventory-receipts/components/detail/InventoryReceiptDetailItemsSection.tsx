import { PackageSearch } from "lucide-react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import type {
  InventoryReceiptDetail,
  InventoryReceiptItemDetail,
} from "@/lib/types/inventory-receipt.type"
import { vndFormatter } from "@/lib/currency"

const col = createColumnHelper<InventoryReceiptItemDetail>()
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

  col.display({
    id: "purchaseOrderQuantity",
    header: "SL đặt (PO)",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ row }) =>
      row.original.purchaseOrderItem
        ? numberFmt.format(row.original.purchaseOrderItem.quantity)
        : "—",
  }),

  col.accessor("quantity", {
    header: "SL nhận",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("unitPrice", {
    header: "Đơn giá",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => {
      const unitPrice = getValue()
      return unitPrice !== null ? vndFormatter.format(unitPrice) : "—"
    },
  }),

  col.display({
    id: "lineTotal",
    header: "Thành tiền",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
    },
    cell: ({ row }) =>
      row.original.unitPrice !== null
        ? vndFormatter.format(row.original.quantity * row.original.unitPrice)
        : "—",
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
]

type InventoryReceiptDetailItemsSectionProps = {
  detail: InventoryReceiptDetail
}

export function InventoryReceiptDetailItemsSection({
  detail,
}: InventoryReceiptDetailItemsSectionProps) {
  const table = useReactTable({
    data: detail.items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalQuantity = detail.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const totalAmount = detail.items.reduce(
    (sum, item) =>
      sum + (item.unitPrice !== null ? item.quantity * item.unitPrice : 0),
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách vật tư nhập kho
      </h3>

      {detail.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có vật tư nào"
          description="Phiếu nhập kho này chưa có dòng vật tư nào."
        />
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12 hover:bg-muted/45">
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
              <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {detail.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng SL nhận:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalQuantity)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng thành tiền:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {vndFormatter.format(totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
