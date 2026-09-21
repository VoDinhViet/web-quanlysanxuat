import { useMemo } from "react"
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
  InventoryIssueDetail,
  InventoryIssueItem,
} from "@/lib/types/inventory-issue.type"

const col = createColumnHelper<typeof appTableFeatures, InventoryIssueItem>()
const numberFmt = new Intl.NumberFormat("vi-VN")

// Không tách "vật tư"/"thành phẩm" theo issueType như InventoryReceiptDetailItemsSection —
// backend không ràng buộc loại kho ↔ loại hàng trên dòng phiếu xuất (cố ý, xem
// be-quanlysanxuat's InventoryIssuesService.ensureItemsValid), nên nhãn chung "hàng" là đúng cho
// mọi issueType.
const columns = col.columns([
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
    header: "Mã hàng",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
    ),
  }),

  col.accessor("item.name", {
    header: "Tên hàng",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor("quantity", {
    header: "Số lượng",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums font-semibold",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),

  col.accessor("unit.name", {
    header: "ĐVT",
    meta: { headerClassName: "min-w-20" },
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
])

type InventoryIssueDetailItemsSectionProps = {
  inventoryIssue: InventoryIssueDetail
}

export function InventoryIssueDetailItemsSection({
  inventoryIssue,
}: InventoryIssueDetailItemsSectionProps) {
  const table = useTable({
    data: inventoryIssue.items,
    columns,
    features: appTableFeatures,
  })

  const totalQuantity = useMemo(
    () => inventoryIssue.items.reduce((sum, item) => sum + item.quantity, 0),
    [inventoryIssue.items]
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách hàng xuất kho
      </h3>

      {inventoryIssue.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có dòng hàng nào"
          description="Phiếu xuất kho này chưa có dòng hàng nào."
        />
      ) : (
        <Table aria-label="Danh sách hàng xuất kho">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
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

      {inventoryIssue.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng số lượng:
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
