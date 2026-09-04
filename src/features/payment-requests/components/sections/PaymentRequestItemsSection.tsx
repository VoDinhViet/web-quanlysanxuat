import { PackageSearch, TriangleAlert } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import type {
  PaymentRequestDetail,
  PaymentRequestItem,
} from "@/lib/types/payment-request.type"

const col = createColumnHelper<typeof appTableFeatures, PaymentRequestItem>()
const numberFmt = new Intl.NumberFormat("vi-VN")

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
    cell: ({ getValue, row }) => (
      <span
        className={cn(
          getValue() < row.original.orderedQty &&
            "font-semibold text-destructive"
        )}
      >
        {numberFmt.format(getValue())}
      </span>
    ),
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
])

type PaymentRequestItemsSectionProps = {
  paymentRequest: PaymentRequestDetail
}

// Section header + table — no pagination; PO line counts are small. Same "tiêu đề dải" idiom as
// PurchaseOrderItemsSection.tsx.
export function PaymentRequestItemsSection({
  paymentRequest,
}: PaymentRequestItemsSectionProps) {
  const table = useTable({
    data: paymentRequest.items,
    columns: itemColumns,
    features: appTableFeatures,
  })

  const totalAmount = paymentRequest.items.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  )
  const shortageCount = paymentRequest.items.filter(
    (item) => item.receivedQty < item.orderedQty
  ).length

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Danh sách vật tư / hàng hóa
      </h3>

      {paymentRequest.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có vật tư nào"
          description="Yêu cầu thanh toán này chưa có dòng vật tư nào."
        />
      ) : (
        <Table aria-label="Danh sách vật tư / hàng hóa">
          <TableHeader
            columns={table.getFlatHeaders()}
            className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
          >
            {(header) => (
              <TableHead
                id={header.id}
                isRowHeader={header.index === 0}
                className={header.column.columnDef.meta?.headerClassName}
              >
                {!header.isPlaceholder &&
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            )}
          </TableHeader>
          <TableBody items={table.getRowModel().rows}>
            {(row) => (
              <TableRow
                id={row.id}
                className="h-14 bg-card hover:bg-muted/25"
                columns={row.getVisibleCells()}
              >
                {(cell) => (
                  <TableCell
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Cảnh báo nhận thiếu SL */}
      {shortageCount > 0 && (
        <div className="flex items-center gap-2 border-t border-border bg-warning/10 px-4 py-2.5 text-xs font-medium text-warning sm:px-5">
          <TriangleAlert className="size-3.5 shrink-0" />
          Đã nhận thiếu {shortageCount}/{paymentRequest.items.length} dòng so
          với đơn đặt.
        </div>
      )}

      {/* Footer total row */}
      {paymentRequest.items.length > 0 && (
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
