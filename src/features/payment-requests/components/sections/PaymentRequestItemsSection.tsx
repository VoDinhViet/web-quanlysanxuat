import { useMemo } from "react"
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
import { PaymentRequestFormSection } from "@/features/payment-requests/components/composites/PaymentRequestFormSection"
import { PaymentRequestNoteField } from "@/features/payment-requests/components/composites/PaymentRequestNoteField"
import { PaymentRequestExtraCostField } from "@/features/payment-requests/components/composites/PaymentRequestExtraCostField"
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

function buildItemColumns(hasQuotation: boolean) {
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
      id: "item",
      header: "Vật tư / Hàng hóa",
      meta: { headerClassName: "min-w-44" },
      cell: ({ row }) => {
        const { directName, directCode } = row.original
        return (
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">{directName}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {directCode}
            </p>
          </div>
        )
      },
    }),

    col.display({
      id: "orderedQty",
      header: "SL đặt mua",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="space-y-0.5">
            <div>
              <span className="font-medium text-foreground">
                {numberFmt.format(item.orderedQty)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            </div>
            {item.quotationUnit &&
              item.orderedQuotationQty !== null &&
              item.orderedQuotationQty !== undefined && (
                <div className="text-[11px] text-muted-foreground">
                  ({numberFmt.format(item.orderedQuotationQty)}{" "}
                  {item.quotationUnit})
                </div>
              )}
          </div>
        )
      },
    }),

    col.display({
      id: "receivedQty",
      header: "SL đã nhập (OK)",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const item = row.original
        const isShortage = item.receivedQty < item.orderedQty
        return (
          <div className="space-y-0.5">
            <div>
              <span
                className={cn(
                  "font-semibold",
                  isShortage ? "text-destructive" : "text-foreground"
                )}
              >
                {numberFmt.format(item.receivedQty)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            </div>
          </div>
        )
      },
    }),

    ...(hasQuotation
      ? [
          col.display({
            id: "receivedQuotationQty",
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
              const actual = item.receivedQuotationQty
              const expected = item.orderedQuotationQty
              if (actual === null || actual === undefined) {
                return <span className="text-muted-foreground">—</span>
              }

              const isShortage =
                expected !== null && expected !== undefined && actual < expected
              const isExcess =
                expected !== null && expected !== undefined && actual > expected

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

    col.display({
      id: "unitPrice",
      header: "Đơn giá",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const item = row.original
        const quoteUnit = item.quotationUnit || item.unit
        return (
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">
              {currencyFormatter.format(item.unitPrice)} ₫
            </p>
            <p className="text-[11px] text-muted-foreground">/ {quoteUnit}</p>
          </div>
        )
      },
    }),

    col.display({
      id: "lineTotal",
      header: "Thành tiền",
      meta: {
        headerClassName: "min-w-32 text-right",
        cellClassName: "text-right font-medium tabular-nums",
      },
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="space-y-0.5">
            <p className="font-bold text-primary">
              {currencyFormatter.format(item.lineTotal)} ₫
            </p>
            {item.quotationUnit &&
              item.receivedQuotationQty !== null &&
              item.receivedQuotationQty !== undefined && (
                <p className="text-[10.5px] text-muted-foreground">
                  = {numberFmt.format(item.receivedQuotationQty)}{" "}
                  {item.quotationUnit} ×{" "}
                  {currencyFormatter.format(item.unitPrice)}
                </p>
              )}
          </div>
        )
      },
    }),
  ])
}

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

type ExtraCostRowProps = {
  extraCost: number
  extraCostNote?: string | null
}

function ExtraCostRow({ extraCost, extraCostNote }: ExtraCostRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-primary">
      <dt className="flex items-center gap-1.5 font-medium">
        <span>Chi phí phát sinh</span>
        {extraCostNote && (
          <span className="text-[11px] font-normal text-muted-foreground">
            ({extraCostNote})
          </span>
        )}
      </dt>
      <dd className="font-semibold whitespace-nowrap text-primary tabular-nums">
        + {currencyFormatter.format(extraCost)} VND
      </dd>
    </div>
  )
}

type PaymentRequestItemsSectionProps = {
  paymentRequest: PaymentRequestDetail
  currentExtraCost: number
  currentExtraCostNote: string
  hasUnsavedChanges?: boolean
  isSaving?: boolean
  onExtraCostChange?: (next: {
    extraCost: number
    extraCostNote: string | null
  }) => void
  onSave?: () => void
  onRevert?: () => void
}

// Section header + table — no pagination; PO line counts are small. Same "tiêu đề dải" idiom as
// PurchaseOrderItemsSection.tsx.
export function PaymentRequestItemsSection({
  paymentRequest,
  currentExtraCost,
  currentExtraCostNote,
  hasUnsavedChanges,
  isSaving,
  onExtraCostChange,
  onSave,
  onRevert,
}: PaymentRequestItemsSectionProps) {
  const hasQuotation = useMemo(
    () =>
      paymentRequest.items.some((item) => Boolean(item.quotationUnit?.trim())),
    [paymentRequest.items]
  )
  const columns = useMemo(() => buildItemColumns(hasQuotation), [hasQuotation])

  const table = useTable({
    data: paymentRequest.items,
    columns,
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
          {/* Cột trái: cảnh báo, số hóa đơn, chi phí phát sinh và số tiền bằng chữ */}
          <div className="flex flex-col justify-between gap-4 text-xs">
            <div className="space-y-4">
              {/* Mục 1: hóa đơn & ghi chú */}
              <PaymentRequestFormSection
                title="Hóa đơn & ghi chú"
                description="Số hóa đơn NCC để đối chiếu; ghi chú hiển thị trên bản in (mặc định lấy từ đơn mua)."
              >
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <PaymentRequestInvoiceField
                    paymentRequestId={paymentRequest.id}
                    supplierInvoiceNo={paymentRequest.supplierInvoiceNo}
                    editable={
                      paymentRequest.status !== PaymentRequestStatus.CANCELLED
                    }
                  />
                  <PaymentRequestNoteField
                    paymentRequestId={paymentRequest.id}
                    note={paymentRequest.note}
                    purchaseOrderNote={paymentRequest.purchaseOrderNote}
                    editable={
                      paymentRequest.status !== PaymentRequestStatus.CANCELLED
                    }
                  />
                </div>
              </PaymentRequestFormSection>

              {/* Mục 2: chi phí phát sinh sau đặt hàng */}
              <PaymentRequestExtraCostField
                extraCost={paymentRequest.extraCost}
                extraCostNote={paymentRequest.extraCostNote}
                currentExtraCost={currentExtraCost}
                currentExtraCostNote={currentExtraCostNote}
                editable={
                  paymentRequest.status === PaymentRequestStatus.PENDING
                }
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                onExtraCostChange={onExtraCostChange ?? (() => {})}
                onSave={onSave}
                onRevert={onRevert}
              />

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

          {/* Cột phải: cách ra số đề nghị chi = tiền hàng + VAT + chi phí khác của PO − tạm ứng NCC + chi phí phát sinh */}
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
              {(paymentRequest.extraCost ?? 0) > 0 && (
                <ExtraCostRow
                  extraCost={paymentRequest.extraCost!}
                  extraCostNote={paymentRequest.extraCostNote}
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
