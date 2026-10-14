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
import { PaymentRequestInvoiceField } from "@/features/payment-requests/components/composites/PaymentRequestInvoiceField"
import { currencyFormatter } from "@/lib/currency"
import { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import { toVietnameseCurrencyWords } from "@/lib/vietnamese-number-words"
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

  col.accessor("directCode", {
    header: "Mã vật tư",
    meta: { headerClassName: "min-w-24" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
  }),

  col.accessor("directName", {
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
          getValue() < row.original.orderedQty && "font-medium text-destructive"
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
      cellClassName: "text-right font-medium tabular-nums",
    },
    cell: ({ getValue }) => numberFmt.format(getValue()),
  }),
])

type FooterRowProps = {
  label: string
  value: number
}

function FooterRow({ label, value }: FooterRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className="font-medium whitespace-nowrap text-foreground tabular-nums">
        {currencyFormatter.format(value)} VND
      </dd>
    </div>
  )
}

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

  const shortageCount = paymentRequest.items.filter(
    (item) => item.receivedQty < item.orderedQty
  ).length

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium tracking-wide text-foreground uppercase sm:px-5">
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

      {paymentRequest.items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 border-t border-border px-4 py-4 sm:px-5 lg:grid-cols-2 lg:gap-10">
          {/* Cột trái: cảnh báo, ghi chú và số tiền bằng chữ */}
          <div className="flex flex-col justify-between gap-4 text-xs">
            <div className="space-y-4">
              <div className="max-w-sm">
                <PaymentRequestInvoiceField
                  paymentRequestId={paymentRequest.id}
                  supplierInvoiceNo={paymentRequest.supplierInvoiceNo}
                  editable={
                    paymentRequest.status !== PaymentRequestStatus.CANCELLED
                  }
                />
              </div>
              {shortageCount > 0 && (
                <p className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 font-medium text-warning">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                  Đã nhận thiếu {shortageCount}/{paymentRequest.items.length}{" "}
                  dòng so với đơn đặt.
                </p>
              )}
              {paymentRequest.otherCostNote && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Chi phí khác:
                  </span>{" "}
                  {paymentRequest.otherCostNote}
                </p>
              )}
              {paymentRequest.advancePaymentNote && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Tạm ứng NCC:
                  </span>{" "}
                  {paymentRequest.advancePaymentNote}
                </p>
              )}
              {paymentRequest.purchaseOrderNote && (
                <p className="whitespace-pre-line text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Ghi chú PO:
                  </span>{" "}
                  {paymentRequest.purchaseOrderNote}
                </p>
              )}
            </div>

            <p className="border-t border-border/40 pt-3">
              <span className="text-muted-foreground">
                Số tiền viết bằng chữ:{" "}
              </span>
              <span className="font-medium text-foreground italic">
                {toVietnameseCurrencyWords(paymentRequest.requestedAmount)}
              </span>
            </p>
          </div>

          {/* Cột phải: cách ra số đề nghị chi = tiền hàng + VAT + chi phí khác của PO − tạm ứng NCC */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-border/60 lg:pl-10">
            <dl className="space-y-2.5 text-xs text-muted-foreground">
              <FooterRow
                label="Thành tiền (chưa thuế)"
                value={paymentRequest.subtotal}
              />
              <FooterRow
                label={`Thuế VAT (${currencyFormatter.format(paymentRequest.vatPercent)}%)`}
                value={paymentRequest.vatAmount}
              />
              <FooterRow
                label="Chi phí khác"
                value={paymentRequest.otherCost}
              />
              <FooterRow
                label="Tổng giá trị PO"
                value={paymentRequest.purchaseOrderTotalAmount}
              />
              {paymentRequest.advancePaymentAmount > 0 && (
                <FooterRow
                  label="Đã tạm ứng NCC"
                  value={-paymentRequest.advancePaymentAmount}
                />
              )}
            </dl>

            <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
              <span className="font-heading text-sm font-medium text-foreground">
                Còn lại phải thanh toán
              </span>
              <div className="text-right">
                <span className="font-mono text-2xl font-semibold tracking-tight text-primary tabular-nums">
                  {currencyFormatter.format(paymentRequest.requestedAmount)}
                </span>
                <span className="ml-1 text-xs font-medium text-primary">
                  VND
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
