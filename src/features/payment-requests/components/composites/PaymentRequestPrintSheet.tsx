import { format, parseISO } from "date-fns"

import { vnZone } from "@/lib/time"
import { toVietnameseCurrencyWords } from "@/lib/vietnamese-number-words"
import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestPrintSheetProps = {
  paymentRequest: PaymentRequestDetail
  className?: string
}

const numberFmt = new Intl.NumberFormat("vi-VN")

const signatureBoxes = [
  "Người lập phiếu",
  "Kế toán",
  "Trưởng phòng",
  "Giám đốc",
]

// Chứng từ in — chỉ hiện khi in (`hidden print:block`, xem @media print trong styles.css). Luật
// trình bày riêng cho khổ A4: đen trắng, viền mảnh, không bo góc, không shadow — không dùng lại
// Surface/section shell hay shadcn <Table> của phần xem trên web.
export function PaymentRequestPrintSheet({
  paymentRequest,
  className,
}: PaymentRequestPrintSheetProps) {
  return (
    <div
      className={cn("hidden bg-white p-8 text-black print:block", className)}
    >
      <div className="flex items-start justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-sm font-semibold uppercase">
            Công ty Cơ khí Tiến Huy
          </p>
          <p className="text-xs">Bộ phận: Kế toán — Mua hàng</p>
        </div>
        <div className="text-right text-xs">
          <p>
            Mã YCTT: <span className="font-medium">{paymentRequest.code}</span>
          </p>
          <p>
            Ngày tạo:{" "}
            {format(
              parseISO(paymentRequest.createdAt, { in: vnZone }),
              "dd/MM/yyyy"
            )}
          </p>
        </div>
      </div>

      <h1 className="mt-4 text-center text-xl font-semibold uppercase">
        Đề nghị thanh toán
      </h1>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        <p>
          <span className="font-medium">Nhà cung cấp:</span>{" "}
          {paymentRequest.supplier.name} ({paymentRequest.supplier.code})
        </p>
        <p>
          <span className="font-medium">PO liên quan:</span>{" "}
          {paymentRequest.purchaseOrder.code} —{" "}
          {format(
            parseISO(paymentRequest.purchaseOrder.orderDate, { in: vnZone }),
            "dd/MM/yyyy"
          )}
        </p>
        <p className="col-span-2">
          <span className="font-medium">Địa chỉ:</span>{" "}
          {paymentRequest.supplier.address}
        </p>
        <p>
          <span className="font-medium">Điện thoại:</span>{" "}
          {paymentRequest.supplier.phoneNumber}
        </p>
        <p>
          <span className="font-medium">Hạn thanh toán:</span>{" "}
          {format(
            parseISO(paymentRequest.dueDate, { in: vnZone }),
            "dd/MM/yyyy"
          )}
        </p>
        {paymentRequest.supplierInvoiceNo ? (
          <p>
            <span className="font-medium">Số hóa đơn:</span>{" "}
            {paymentRequest.supplierInvoiceNo}
          </p>
        ) : null}
        {paymentRequest.isUrgent ? (
          <p>
            <span className="font-medium">Mức độ:</span> Gấp
          </p>
        ) : null}
      </div>

      {(() => {
        const hasQuotation = paymentRequest.items.some((item) =>
          Boolean(item.quotationUnit?.trim())
        )
        const colSpanCount = hasQuotation ? 8 : 6

        return (
          <table className="mt-4 w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 text-center">
                  STT
                </th>
                <th className="border border-black px-2 py-1 text-left">
                  Mã vật tư
                </th>
                <th className="border border-black px-2 py-1 text-left">
                  Tên vật tư / hàng hóa
                </th>
                <th className="border border-black px-2 py-1 text-center">
                  ĐVT
                </th>
                <th className="border border-black px-2 py-1 text-right">
                  SL đặt
                </th>
                {hasQuotation && (
                  <>
                    <th className="border border-black px-2 py-1 text-right">
                      Qty BG
                    </th>
                    <th className="border border-black px-2 py-1 text-center">
                      ĐVBG
                    </th>
                  </>
                )}
                <th className="border border-black px-2 py-1 text-right">
                  Đơn giá
                </th>
                <th className="border border-black px-2 py-1 text-right">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentRequest.items.map((item, index) => {
                const quoteUnit = item.quotationUnit || item.unit
                return (
                  <tr key={item.id}>
                    <td className="border border-black px-2 py-1 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-black px-2 py-1">
                      {item.directCode}
                    </td>
                    <td className="border border-black px-2 py-1">
                      {item.directName}
                    </td>
                    <td className="border border-black px-2 py-1 text-center">
                      {item.unit}
                    </td>
                    <td className="border border-black px-2 py-1 text-right">
                      {numberFmt.format(item.orderedQty)}
                    </td>
                    {hasQuotation && (
                      <>
                        <td className="border border-black px-2 py-1 text-right font-medium">
                          {item.receivedQuotationQty !== null &&
                          item.receivedQuotationQty !== undefined
                            ? numberFmt.format(item.receivedQuotationQty)
                            : "—"}
                        </td>
                        <td className="border border-black px-2 py-1 text-center">
                          {item.quotationUnit || "—"}
                        </td>
                      </>
                    )}
                    <td className="border border-black px-2 py-1 text-right">
                      {numberFmt.format(item.unitPrice)} đ / {quoteUnit}
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-medium">
                      {numberFmt.format(item.lineTotal)} đ
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              {paymentRequest.advancePaymentAmount > 0 ||
              (paymentRequest.extraCost ?? 0) > 0 ? (
                <>
                  <tr>
                    <td
                      colSpan={colSpanCount}
                      className="border border-black px-2 py-1 text-right font-medium"
                    >
                      Tổng giá trị PO
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-medium">
                      {vndFormatter.format(
                        paymentRequest.purchaseOrderTotalAmount
                      )}{" "}
                      đ
                    </td>
                  </tr>
                  {paymentRequest.advancePaymentAmount > 0 && (
                    <tr>
                      <td
                        colSpan={colSpanCount}
                        className="border border-black px-2 py-1 text-right"
                      >
                        Đã tạm ứng NCC
                        {paymentRequest.advancePaymentNote
                          ? ` (${paymentRequest.advancePaymentNote})`
                          : ""}
                      </td>
                      <td className="border border-black px-2 py-1 text-right">
                        −{" "}
                        {vndFormatter.format(
                          paymentRequest.advancePaymentAmount
                        )}{" "}
                        đ
                      </td>
                    </tr>
                  )}
                  {(paymentRequest.extraCost ?? 0) > 0 && (
                    <tr>
                      <td
                        colSpan={colSpanCount}
                        className="border border-black px-2 py-1 text-right"
                      >
                        Chi phí phát sinh
                        {paymentRequest.extraCostNote
                          ? ` (${paymentRequest.extraCostNote})`
                          : ""}
                      </td>
                      <td className="border border-black px-2 py-1 text-right">
                        + {vndFormatter.format(paymentRequest.extraCost!)} đ
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={colSpanCount}
                      className="border border-black px-2 py-1 text-right font-medium"
                    >
                      Còn lại phải thanh toán
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-medium">
                      {vndFormatter.format(paymentRequest.requestedAmount)} đ
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td
                    colSpan={colSpanCount}
                    className="border border-black px-2 py-1 text-right font-medium"
                  >
                    Tổng cộng
                  </td>
                  <td className="border border-black px-2 py-1 text-right font-medium">
                    {vndFormatter.format(paymentRequest.requestedAmount)} đ
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        )
      })()}

      <p className="mt-3 text-xs">
        <span className="font-medium">Bằng chữ:</span>{" "}
        {toVietnameseCurrencyWords(paymentRequest.requestedAmount)} chẵn.
      </p>

      {(paymentRequest.note ?? paymentRequest.purchaseOrderNote) ? (
        <p className="mt-2 text-xs whitespace-pre-line">
          <span className="font-medium">Ghi chú:</span>{" "}
          {paymentRequest.note ?? paymentRequest.purchaseOrderNote}
        </p>
      ) : null}

      <div className="mt-10 grid grid-cols-4 gap-4 text-center text-xs">
        {signatureBoxes.map((label) => (
          <div key={label}>
            <p className="font-medium">{label}</p>
            <p className="text-[10px] text-neutral-600">(Ký, ghi rõ họ tên)</p>
            <div className="mt-14" />
          </div>
        ))}
      </div>
    </div>
  )
}
