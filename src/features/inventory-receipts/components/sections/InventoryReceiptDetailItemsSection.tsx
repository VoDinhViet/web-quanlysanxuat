import { useMemo } from "react"
import { AlertTriangle, PackageSearch } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  InventoryReceiptDetail,
  InventoryReceiptItemDetail,
} from "@/lib/types/inventory-receipt.type"
import { resolveInventoryReceiptItemType } from "@/lib/types/inventory-receipt.type"
import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"

const col = createColumnHelper<
  typeof appTableFeatures,
  InventoryReceiptItemDetail
>()
const numberFmt = new Intl.NumberFormat("vi-VN")

// itemNoun: "vật tư" (PURCHASE/RETURN) hay "thành phẩm" (PRODUCTION) — theo
// resolveInventoryReceiptItemType(receiptType), cùng khuôn InventoryReceiptCreateGenericItemsSection.tsx.
function buildInventoryReceiptDetailItemColumns({
  itemNoun,
}: {
  itemNoun: string
}) {
  return col.columns([
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
      header: `Mã ${itemNoun}`,
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold">{getValue()}</span>
      ),
    }),

    col.accessor("item.name", {
      header: `Tên ${itemNoun}`,
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
      header: "SL giao",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => numberFmt.format(getValue()),
    }),

    col.display({
      id: "returnedQuantity",
      header: "SL trả NCC",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const returned = row.original.returnedQuantity ?? 0
        if (returned <= 0) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                  <AlertTriangle className="size-3 text-destructive" />
                  {numberFmt.format(returned)}
                </span>
              }
            />
            <TooltipContent>
              Đã xuất trả lại NCC do kiểm tra IQC không đạt (
              {numberFmt.format(returned)} {row.original.unit.name})
            </TooltipContent>
          </Tooltip>
        )
      },
    }),

    col.display({
      id: "actualQuantity",
      header: "SL thực nhập",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums font-semibold",
      },
      cell: ({ row }) => {
        const returned = row.original.returnedQuantity ?? 0
        const actual =
          row.original.actualQuantity ??
          Math.max(row.original.quantity - returned, 0)
        return (
          <span
            className={cn(
              actual === 0 && returned > 0
                ? "text-destructive line-through"
                : "text-foreground"
            )}
          >
            {numberFmt.format(actual)}
          </span>
        )
      },
    }),

    col.accessor("unit.name", {
      header: "ĐVT",
      meta: { headerClassName: "min-w-20" },
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
      cell: ({ row }) => {
        const returned = row.original.returnedQuantity ?? 0
        const actual =
          row.original.actualQuantity ??
          Math.max(row.original.quantity - returned, 0)
        return row.original.unitPrice !== null
          ? vndFormatter.format(actual * row.original.unitPrice)
          : "—"
      },
    }),

    col.accessor("note", {
      header: "Ghi chú",
      meta: { headerClassName: "min-w-36" },
      cell: ({ getValue }) => getValue() ?? "—",
    }),
  ])
}

type InventoryReceiptDetailItemsSectionProps = {
  inventoryReceipt: InventoryReceiptDetail
}

export function InventoryReceiptDetailItemsSection({
  inventoryReceipt,
}: InventoryReceiptDetailItemsSectionProps) {
  const itemNoun =
    resolveInventoryReceiptItemType(inventoryReceipt.receiptType) === "FG"
      ? "thành phẩm"
      : "vật tư"
  const columns = useMemo(
    () => buildInventoryReceiptDetailItemColumns({ itemNoun }),
    [itemNoun]
  )

  const table = useTable({
    data: inventoryReceipt.items,
    columns,
    features: appTableFeatures,
  })

  const totalQuantity = inventoryReceipt.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const totalReturned = inventoryReceipt.items.reduce(
    (sum, item) => sum + (item.returnedQuantity ?? 0),
    0
  )
  const totalActual = inventoryReceipt.items.reduce(
    (sum, item) =>
      sum +
      (item.actualQuantity ??
        Math.max(item.quantity - (item.returnedQuantity ?? 0), 0)),
    0
  )
  const totalAmount = inventoryReceipt.items.reduce((sum, item) => {
    const actual =
      item.actualQuantity ??
      Math.max(item.quantity - (item.returnedQuantity ?? 0), 0)
    return sum + (item.unitPrice !== null ? actual * item.unitPrice : 0)
  }, 0)

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách {itemNoun} nhập kho
      </h3>

      {totalReturned > 0 && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs text-destructive sm:px-5">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Phiếu nhập kho này có{" "}
            <strong>{numberFmt.format(totalReturned)}</strong> {itemNoun} bị từ
            chối qua kiểm tra chất lượng (IQC) và đã xuất trả lại nhà cung cấp.
          </span>
        </div>
      )}

      {inventoryReceipt.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title={`Chưa có ${itemNoun} nào`}
          description={`Phiếu nhập kho này chưa có dòng ${itemNoun} nào.`}
        />
      ) : (
        <Table aria-label={`Danh sách ${itemNoun} nhập kho`}>
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

      {inventoryReceipt.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng SL giao:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalQuantity)}
            </span>
          </div>
          {totalReturned > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold tracking-wide text-destructive uppercase">
                Tổng SL trả NCC:
              </span>
              <span className="font-semibold text-destructive tabular-nums">
                {numberFmt.format(totalReturned)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng SL thực nhập:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalActual)}
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
