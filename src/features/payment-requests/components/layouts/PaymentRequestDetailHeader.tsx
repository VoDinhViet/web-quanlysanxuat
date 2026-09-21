import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { PaymentRequestStatusBadge } from "@/features/payment-requests/components/primitives/PaymentRequestBadges"
import { PaymentRequestAmountStrip } from "@/features/payment-requests/components/composites/PaymentRequestAmountStrip"
import { PaymentRequestDetailActions } from "@/features/payment-requests/components/layouts/PaymentRequestDetailActions"
import { vndFormatter } from "@/lib/currency"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailHeaderProps = {
  paymentRequest: PaymentRequestDetail
}

// Nhà cung cấp đã dời sang PaymentRequestSupplierCard.tsx (sidebar) — header giờ chỉ còn 4 ô về
// *chứng từ*: PO / Ngày PO / Giá trị PO / Ngày tạo YCTT. Số tiền đề nghị chi + hạn thanh toán lên
// PaymentRequestAmountStrip (điểm nhấn chính của trang).
export function PaymentRequestDetailHeader({
  paymentRequest,
}: PaymentRequestDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      {/* Back + code + badge, cùng hàng với action buttons — cả 2 là 1 hàng flex full width, để
          divider của PaymentRequestAmountStrip bên dưới kéo hết chiều rộng thẻ thay vì chỉ hết
          chiều rộng cột trái (bản cũ lồng amount strip trong cùng flex item với action buttons,
          border-t vì vậy hụt hẳn phần bên phải). */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/payment-requests"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách yêu cầu thanh toán"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {paymentRequest.code}
          </span>
          <PaymentRequestStatusBadge status={paymentRequest.status} />
        </div>

        <PaymentRequestDetailActions paymentRequest={paymentRequest} />
      </div>

      <PaymentRequestAmountStrip paymentRequest={paymentRequest} />

      {/* Meta fields — 4 ô về chứng từ */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        <MetaField
          label="PO"
          value={
            <Link
              to="/manage/purchase-orders/$purchaseOrderId"
              params={{ purchaseOrderId: paymentRequest.purchaseOrder.id }}
              className="font-mono text-primary hover:underline"
            >
              {paymentRequest.purchaseOrder.code}
            </Link>
          }
        />
        <MetaField
          label="Ngày PO"
          value={DateTime.fromISO(
            paymentRequest.purchaseOrder.orderDate
          ).toFormat("dd/MM/yyyy")}
        />
        <MetaField
          label="Giá trị PO"
          value={`${vndFormatter.format(paymentRequest.poValue)} ₫`}
        />
        <MetaField
          label="Ngày tạo YCTT"
          value={DateTime.fromISO(paymentRequest.createdAt).toFormat(
            "dd/MM/yyyy"
          )}
        />
      </div>
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
