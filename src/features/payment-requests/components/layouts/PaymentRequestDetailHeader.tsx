import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { PaymentRequestStatusBadge } from "@/features/payment-requests/components/primitives/PaymentRequestBadges"
import { PaymentRequestDetailActions } from "@/features/payment-requests/components/layouts/PaymentRequestDetailActions"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestDetailHeaderProps = {
  paymentRequest: PaymentRequestDetail
}

// Same MetaField grid as PurchaseOrderDetailHeader.tsx — 3-column layout.
export function PaymentRequestDetailHeader({
  paymentRequest,
}: PaymentRequestDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Back + code + badge */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách yêu cầu thanh toán"
            asChild
          >
            <Link to="/manage/payment-requests" search={{ page: 1, limit: 10 }}>
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {paymentRequest.code}
          </span>
          <PaymentRequestStatusBadge status={paymentRequest.status} />
        </div>

        {/* Meta fields — 3 columns */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          {/* Column 1: PO / NCC / Địa chỉ */}
          <div className="flex flex-col gap-4">
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
              label="Nhà cung cấp"
              value={paymentRequest.supplier.name}
            />
            <MetaField
              label="Địa chỉ"
              value={paymentRequest.supplier.address}
            />
          </div>

          {/* Column 2: Ngày PO / Ngày hoàn thành PO / Ngày tạo YCTT */}
          <div className="flex flex-col gap-4">
            <MetaField
              label="Ngày PO"
              value={DateTime.fromISO(
                paymentRequest.purchaseOrder.orderDate
              ).toFormat("dd/MM/yyyy")}
            />
            <MetaField
              label="Hạn thanh toán"
              value={DateTime.fromISO(paymentRequest.dueDate).toFormat(
                "dd/MM/yyyy"
              )}
            />
            <MetaField
              label="Ngày tạo YCTT"
              value={DateTime.fromISO(paymentRequest.createdAt).toFormat(
                "dd/MM/yyyy"
              )}
            />
          </div>

          {/* Column 3: Giá trị PO / Giá trị YCTT / Liên hệ */}
          <div className="flex flex-col gap-4">
            <MetaField
              label="Giá trị PO"
              value={
                new Intl.NumberFormat("vi-VN").format(paymentRequest.poValue) +
                " VND"
              }
            />
            <MetaField
              label="Giá trị yêu cầu TT"
              value={
                new Intl.NumberFormat("vi-VN").format(
                  paymentRequest.requestValue
                ) + " VND"
              }
            />
            <MetaField
              label="Điện thoại"
              value={paymentRequest.supplier.phoneNumber}
            />
          </div>
        </div>
      </div>

      <PaymentRequestDetailActions paymentRequest={paymentRequest} />
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
