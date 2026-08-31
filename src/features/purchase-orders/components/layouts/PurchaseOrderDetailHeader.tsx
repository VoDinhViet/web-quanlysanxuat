import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { PurchaseOrderAssigneeField } from "@/features/purchase-orders/components/composites/PurchaseOrderAssigneeField"
import { PurchaseOrderDetailActions } from "@/features/purchase-orders/components/layouts/PurchaseOrderDetailActions"
import { PurchaseOrderExpectedDateField } from "@/features/purchase-orders/components/composites/PurchaseOrderExpectedDateField"
import { PurchaseOrderNoteField } from "@/features/purchase-orders/components/composites/PurchaseOrderNoteField"
import { PurchaseOrderPaymentTermField } from "@/features/purchase-orders/components/composites/PurchaseOrderPaymentTermField"
import { PurchaseOrderStatusBadge } from "@/features/purchase-orders/components/primitives/PurchaseOrderBadges"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderDetailHeaderProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
}

// Identity + info row, same shell as PurchaseQuotationDetailHeader.tsx / (purchase-requests' own
// copy) — 5th duplicate of this MetaField tile idiom, per the repo's own "no abstraction until
// 3rd use" convention already applied consistently at the other 4 sites. 3-column grid (not the
// generic 1-3 column wrap the other detail headers use): nguồn gốc (NCC/RFQ/PR — dọn từ thẻ
// sidebar riêng vào đây) / thông tin phụ trách+thanh toán / thông tin giao nhận, mirror layout
// tham khảo ban đầu.
export function PurchaseOrderDetailHeader({
  purchaseOrder,
  editable,
}: PurchaseOrderDetailHeaderProps) {
  const purchaseRequests = Array.from(
    new Map(
      purchaseOrder.items.map((item) => [
        item.purchaseRequestItem.purchaseRequest.id,
        item.purchaseRequestItem.purchaseRequest,
      ])
    ).values()
  )

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đơn mua hàng"
            asChild
          >
            <Link to="/manage/purchase-orders" search={{ page: 1, limit: 10 }}>
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {purchaseOrder.code}
          </span>
          <PurchaseOrderStatusBadge status={purchaseOrder.status} />
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField label="NCC" value={purchaseOrder.supplier.name} />
            <MetaField
              label="RFQ nguồn"
              value={
                purchaseOrder.quotation ? (
                  <Link
                    to="/manage/purchase-quotations/$purchaseQuotationId"
                    params={{ purchaseQuotationId: purchaseOrder.quotation.id }}
                    className="font-mono text-primary hover:underline"
                  >
                    {purchaseOrder.quotation.code}
                  </Link>
                ) : (
                  "Không có"
                )
              }
            />
            <MetaField
              label="PR nguồn"
              value={
                purchaseRequests.length > 0 ? (
                  <span className="flex flex-col gap-0.5">
                    {purchaseRequests.map((purchaseRequest) => (
                      <Link
                        key={purchaseRequest.id}
                        to="/manage/purchase-requests/$purchaseRequestId"
                        params={{ purchaseRequestId: purchaseRequest.id }}
                        className="font-mono text-primary hover:underline"
                      >
                        {purchaseRequest.code}
                      </Link>
                    ))}
                  </span>
                ) : (
                  "Không có"
                )
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            <PurchaseOrderAssigneeField
              purchaseOrderId={purchaseOrder.id}
              assignedUser={purchaseOrder.assignedUser}
              editable={editable}
            />
            <PurchaseOrderPaymentTermField
              purchaseOrderId={purchaseOrder.id}
              paymentTerm={purchaseOrder.paymentTerm}
              editable={editable}
            />
            <MetaField
              label="Ngày đặt"
              value={DateTime.fromISO(purchaseOrder.orderDate).toFormat(
                "dd/MM/yyyy"
              )}
            />
          </div>

          <div className="flex flex-col gap-4">
            <PurchaseOrderExpectedDateField
              purchaseOrderId={purchaseOrder.id}
              expectedDate={purchaseOrder.expectedDate}
              editable={editable}
            />
            <PurchaseOrderNoteField
              purchaseOrderId={purchaseOrder.id}
              note={purchaseOrder.note}
              editable={editable}
            />
          </div>
        </div>
      </div>

      <PurchaseOrderDetailActions purchaseOrder={purchaseOrder} />
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
