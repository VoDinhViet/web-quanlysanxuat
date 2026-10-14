import { useMemo } from "react"
import { AlertTriangle, PackageSearch } from "lucide-react"
import { Gallery } from "@solar-icons/react"
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
  InventoryReceiptDetail,
  InventoryReceiptItemDetail,
} from "@/lib/types/inventory-receipt.type"
import { resolveInventoryReceiptItemType } from "@/lib/types/inventory-receipt.type"
import { vndFormatter } from "@/lib/currency"
import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

const col = createColumnHelper<
  typeof appTableFeatures,
  InventoryReceiptItemDetail
>()
const numberFmt = new Intl.NumberFormat("vi-VN")

// itemNoun: "vật tư" (PURCHASE/RETURN) hay "thành phẩm" (PRODUCTION) — theo
// resolveInventoryReceiptItemType(receiptType), cùng khuôn CreateInventoryReceiptGenericItemsSection.tsx.
function buildInventoryReceiptDetailItemColumns({
  itemNoun,
  hasQuotation,
}: {
  itemNoun: string
  hasQuotation: boolean
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

    col.display({
      id: "image",
      header: "Hình ảnh",
      meta: {
        headerClassName: "w-20 text-center",
        cellClassName: "py-2 text-center",
      },
      cell: ({ row }) => {
        const { image, name } = row.original.item
        return (
          <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {image ? (
              <ZoomableImage src={resolveFileUrl(image.url)} alt={name} />
            ) : (
              <Gallery className="size-4 text-muted-foreground/50" />
            )}
          </div>
        )
      },
    }),

    col.display({
      id: "item",
      header: itemNoun === "thành phẩm" ? "Thành phẩm" : "Vật tư",
      meta: { headerClassName: "min-w-44" },
      cell: ({ row }) => {
        const { name, code } = row.original.item
        return (
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">{name}</p>
            <p className="font-mono text-xs text-muted-foreground">{code}</p>
          </div>
        )
      },
    }),

    col.display({
      id: "purchaseOrderQuantity",
      header: "SL đặt (PO)",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) => {
        const item = row.original
        if (!item.purchaseOrderItem) return "—"
        return (
          <div className="space-y-0.5">
            <div>
              <span className="font-medium text-foreground">
                {numberFmt.format(item.purchaseOrderItem.quantity)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">
                {item.unit.name}
              </span>
            </div>
            {item.quotationUnit &&
              item.orderedQuotationQuantity !== null &&
              item.orderedQuotationQuantity !== undefined && (
                <div className="text-[11px] text-muted-foreground">
                  ({numberFmt.format(item.orderedQuotationQuantity)}{" "}
                  {item.quotationUnit})
                </div>
              )}
          </div>
        )
      },
    }),

    col.display({
      id: "actualQuantity",
      header: "SL thực nhập",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const item = row.original
        const returned = item.returnedQuantity ?? 0
        const actual =
          item.actualQuantity ?? Math.max(item.quantity - returned, 0)
        const hasDifference = returned > 0 || actual !== item.quantity

        return (
          <div className="space-y-0.5">
            <div>
              <span
                className={cn(
                  "font-semibold",
                  actual === 0 && returned > 0
                    ? "text-destructive line-through"
                    : "text-foreground"
                )}
              >
                {numberFmt.format(actual)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">
                {item.unit.name}
              </span>
            </div>

            {hasDifference && (
              <div className="flex flex-col items-end gap-0.5 text-[11px]">
                {returned > 0 && (
                  <span className="text-destructive font-medium">
                    Trả NCC: {numberFmt.format(returned)} {item.unit.name}
                  </span>
                )}
                {actual !== item.quantity && (
                  <span className="text-muted-foreground">
                    Giao: {numberFmt.format(item.quantity)}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      },
    }),

    ...(hasQuotation
      ? [
          col.display({
            id: "quotationQuantity",
            header: "Qty BG",
            meta: {
              headerClassName: "min-w-24 text-right",
              cellClassName: "text-right tabular-nums",
            },
            cell: ({ row }) => {
              const item = row.original
              if (!item.quotationUnit?.trim()) {
                return <span className="text-muted-foreground">—</span>
              }
              const actual = item.quotationQuantity
              const expected = item.orderedQuotationQuantity
              if (actual === null || actual === undefined) {
                return <span className="text-muted-foreground">—</span>
              }

              const isShortage =
                expected !== null &&
                expected !== undefined &&
                actual < expected
              const isExcess =
                expected !== null &&
                expected !== undefined &&
                actual > expected

              return (
                <div className="space-y-0.5">
                  <div
                    className={cn(
                      "font-semibold",
                      isShortage && "text-amber-600 dark:text-amber-400",
                      isExcess && "text-blue-600 dark:text-blue-400",
                      !isShortage && !isExcess && "text-foreground"
                    )}
                  >
                    {numberFmt.format(actual)}
                  </div>
                  {isShortage && (
                    <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Hụt {numberFmt.format(expected - actual)}
                    </div>
                  )}
                  {isExcess && (
                    <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      Vượt +{numberFmt.format(actual - expected)}
                    </div>
                  )}
                </div>
              )
            },
          }),
          col.accessor((row) => row.quotationUnit || "—", {
            id: "quotationUnit",
            header: "ĐVBG",
            meta: {
              headerClassName: "w-20",
              cellClassName: "text-muted-foreground",
            },
          }),
        ]
      : []),

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
        cellClassName: "text-right tabular-nums font-medium",
      },
      cell: ({ row }) => {
        const item = row.original
        const returned = item.returnedQuantity ?? 0
        const actual =
          item.actualQuantity ?? Math.max(item.quantity - returned, 0)
        const qtyForAmount =
          item.quotationUnit &&
          item.quotationQuantity !== null &&
          item.quotationQuantity !== undefined
            ? item.quotationQuantity
            : actual
        return item.unitPrice !== null
          ? vndFormatter.format(qtyForAmount * item.unitPrice)
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

  const hasQuotation = useMemo(
    () =>
      inventoryReceipt.items.some((item) =>
        Boolean(item.quotationUnit?.trim())
      ),
    [inventoryReceipt.items]
  )

  const columns = useMemo(
    () => buildInventoryReceiptDetailItemColumns({ itemNoun, hasQuotation }),
    [itemNoun, hasQuotation]
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
    const qtyForAmount =
      item.quotationUnit &&
      item.quotationQuantity !== null &&
      item.quotationQuantity !== undefined
        ? item.quotationQuantity
        : actual
    return sum + (item.unitPrice !== null ? qtyForAmount * item.unitPrice : 0)
  }, 0)

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium tracking-wide text-foreground uppercase sm:px-5">
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
            <span className="font-medium tracking-wide text-muted-foreground uppercase">
              Tổng SL giao:
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {numberFmt.format(totalQuantity)}
            </span>
          </div>
          {totalReturned > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium tracking-wide text-destructive uppercase">
                Tổng SL trả NCC:
              </span>
              <span className="font-medium text-destructive tabular-nums">
                {numberFmt.format(totalReturned)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium tracking-wide text-muted-foreground uppercase">
              Tổng SL thực nhập:
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {numberFmt.format(totalActual)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium tracking-wide text-muted-foreground uppercase">
              Tổng thành tiền:
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {vndFormatter.format(totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
