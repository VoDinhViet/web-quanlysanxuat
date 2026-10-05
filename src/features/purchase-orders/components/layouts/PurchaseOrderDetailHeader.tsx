import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { PurchaseOrderAssignee } from "@/features/purchase-orders/components/composites/PurchaseOrderAssignee"
import { PurchaseOrderDetailActions } from "@/features/purchase-orders/components/layouts/PurchaseOrderDetailActions"
import { PurchaseOrderExpectedDateField } from "@/features/purchase-orders/components/composites/PurchaseOrderExpectedDateField"
import { PurchaseOrderNoteField } from "@/features/purchase-orders/components/composites/PurchaseOrderNoteField"
import { PurchaseOrderPaymentTermField } from "@/features/purchase-orders/components/composites/PurchaseOrderPaymentTermField"
import { PurchaseOrderProgressBadge } from "@/features/purchase-orders/components/primitives/PurchaseOrderBadges"
import { cn } from "@/lib/utils"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderDetailHeaderProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
}

// Identity + info row, same shell as PurchaseQuotationDetailHeader.tsx / (purchase-requests' own
// copy) — 5th duplicate of this MetaField tile idiom, per the repo's own "no abstraction until
// 3rd use" convention already applied consistently at the other 4 sites. Top row: back/code/status
// left, actions right. Below, a 12-column grid (từ lg): hàng 1 chỉ đọc (NCC 4/RFQ 3/PR 3/ngày đặt 2),
// hàng 2 ba trường chỉnh được (mỗi ô 4 cột), ghi chú chiếm trọn hàng cuối.
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
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/purchase-orders"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đơn mua hàng"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {purchaseOrder.code}
          </span>
          <PurchaseOrderProgressBadge progress={purchaseOrder.progress} />
        </div>

        <PurchaseOrderDetailActions purchaseOrder={purchaseOrder} />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-12">
        <MetaField
          className="sm:col-span-2 lg:col-span-4"
          label="NCC"
          value={purchaseOrder.supplier.name}
        />
        <MetaField
          className="lg:col-span-3"
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
          className="lg:col-span-3"
          label="PR nguồn"
          value={
            purchaseRequests.length > 0 ? (
              <span className="flex flex-wrap gap-x-3 gap-y-0.5">
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
        <MetaField
          className="lg:col-span-2"
          label="Ngày đặt"
          value={DateTime.fromISO(purchaseOrder.orderDate).toFormat(
            "dd/MM/yyyy"
          )}
        />

        <div className="min-w-0 lg:col-span-4">
          <PurchaseOrderAssignee
            purchaseOrderId={purchaseOrder.id}
            assignedUser={purchaseOrder.assignedUser}
            editable={editable}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <PurchaseOrderPaymentTermField
            purchaseOrderId={purchaseOrder.id}
            paymentTerm={purchaseOrder.paymentTerm}
            editable={editable}
          />
        </div>
        <div className="min-w-0 sm:col-span-2 lg:col-span-4">
          <PurchaseOrderExpectedDateField
            purchaseOrderId={purchaseOrder.id}
            expectedDate={purchaseOrder.expectedDate}
            editable={editable}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-12">
          <PurchaseOrderNoteField
            purchaseOrderId={purchaseOrder.id}
            note={purchaseOrder.note}
            editable={editable}
          />
        </div>
      </div>
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
  className?: string
}

function MetaField({ label, value, className }: MetaFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="text-sm font-medium break-words text-foreground">
        {value}
      </div>
    </div>
  )
}
