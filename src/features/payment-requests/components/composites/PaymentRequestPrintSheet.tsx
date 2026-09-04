import { DateTime } from "luxon"

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
          <p className="text-sm font-bold uppercase">Công ty Cơ khí Tiến Huy</p>
          <p className="text-xs">Bộ phận: Kế toán — Mua hàng</p>
        </div>
        <div className="text-right text-xs">
          <p>
            Mã YCTT:{" "}
            <span className="font-semibold">{paymentRequest.code}</span>
          </p>
          <p>
            Ngày tạo:{" "}
            {DateTime.fromISO(paymentRequest.createdAt).toFormat("dd/MM/yyyy")}
          </p>
        </div>
      </div>

      <h1 className="mt-4 text-center text-xl font-bold uppercase">
        Đề nghị thanh toán
      </h1>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        <p>
          <span className="font-semibold">Nhà cung cấp:</span>{" "}
          {paymentRequest.supplier.name} ({paymentRequest.supplier.code})
        </p>
        <p>
          <span className="font-semibold">PO liên quan:</span>{" "}
          {paymentRequest.purchaseOrder.code} —{" "}
          {DateTime.fromISO(paymentRequest.purchaseOrder.orderDate).toFormat(
            "dd/MM/yyyy"
          )}
        </p>
        <p className="col-span-2">
          <span className="font-semibold">Địa chỉ:</span>{" "}
          {paymentRequest.supplier.address}
        </p>
        <p>
          <span className="font-semibold">Điện thoại:</span>{" "}
          {paymentRequest.supplier.phoneNumber}
        </p>
        <p>
          <span className="font-semibold">Hạn thanh toán:</span>{" "}
          {DateTime.fromISO(paymentRequest.dueDate).toFormat("dd/MM/yyyy")}
        </p>
      </div>

      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-center">STT</th>
            <th className="border border-black px-2 py-1 text-left">
              Mã vật tư
            </th>
            <th className="border border-black px-2 py-1 text-left">
              Tên vật tư / hàng hóa
            </th>
            <th className="border border-black px-2 py-1 text-center">ĐVT</th>
            <th className="border border-black px-2 py-1 text-right">SL đặt</th>
            <th className="border border-black px-2 py-1 text-right">
              Đơn giá
            </th>
            <th className="border border-black px-2 py-1 text-right">
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody>
          {paymentRequest.items.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-black px-2 py-1 text-center">
                {index + 1}
              </td>
              <td className="border border-black px-2 py-1">
                {item.materialCode}
              </td>
              <td className="border border-black px-2 py-1">
                {item.materialName}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.unit}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {numberFmt.format(item.orderedQty)}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {numberFmt.format(item.unitPrice)}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {numberFmt.format(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={6}
              className="border border-black px-2 py-1 text-right font-semibold"
            >
              Tổng cộng
            </td>
            <td className="border border-black px-2 py-1 text-right font-semibold">
              {vndFormatter.format(paymentRequest.requestValue)} đ
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-3 text-xs">
        <span className="font-semibold">Bằng chữ:</span>{" "}
        {toVietnameseCurrencyWords(paymentRequest.requestValue)} chẵn.
      </p>

      {paymentRequest.note ? (
        <p className="mt-2 text-xs">
          <span className="font-semibold">Ghi chú:</span> {paymentRequest.note}
        </p>
      ) : null}

      <div className="mt-10 grid grid-cols-4 gap-4 text-center text-xs">
        {signatureBoxes.map((label) => (
          <div key={label}>
            <p className="font-semibold">{label}</p>
            <p className="text-[10px] text-neutral-600">(Ký, ghi rõ họ tên)</p>
            <div className="mt-14" />
          </div>
        ))}
      </div>
    </div>
  )
}
