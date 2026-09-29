import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { useEffect } from "react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { currentUserQueryOptions } from "@/features/auth/api"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
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
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const { data: profile } = useQuery(currentUserQueryOptions)

  const { mutate: assignCurrentUser } = useMutation({
    mutationFn: (assignedUserId: string) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId: purchaseOrder.id, assignedUserId },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  })

  // Đơn mua chưa có người phụ trách: mặc định gán theo user đăng nhập
  useEffect(() => {
    if (editable && !purchaseOrder.assignedUser && profile?.id) {
      assignCurrentUser(profile.id)
    }
  }, [editable, purchaseOrder.assignedUser, profile?.id, assignCurrentUser])

  const assignedUserName =
    purchaseOrder.assignedUser?.fullName ??
    profile?.fullName ??
    profile?.username ??
    "—"

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
          <PurchaseOrderStatusBadge status={purchaseOrder.status} />
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
          <MetaField label="NCC" value={purchaseOrder.supplier.name} />
          <MetaField label="Người phụ trách" value={assignedUserName} />
          <MetaField
            label="Ngày đặt"
            value={DateTime.fromISO(purchaseOrder.orderDate).toFormat(
              "dd/MM/yyyy"
            )}
          />

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
          <PurchaseOrderPaymentTermField
            purchaseOrderId={purchaseOrder.id}
            paymentTerm={purchaseOrder.paymentTerm}
            editable={editable}
          />
          <PurchaseOrderExpectedDateField
            purchaseOrderId={purchaseOrder.id}
            expectedDate={purchaseOrder.expectedDate}
            editable={editable}
          />

          <MetaField
            label="PR nguồn"
            value={
              purchaseRequests.length > 0 ? (
                <span className="flex flex-wrap gap-1.5">
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
          <div className="sm:col-span-2">
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
