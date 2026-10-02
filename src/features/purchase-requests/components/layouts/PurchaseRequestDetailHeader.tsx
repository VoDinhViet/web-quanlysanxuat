import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { PurchaseRequestStatusBadge } from "@/features/purchase-requests/components/primitives/PurchaseRequestBadges"
import { PurchaseRequestDetailActions } from "@/features/purchase-requests/components/layouts/PurchaseRequestDetailActions"
import { PurchaseRequestNeededDateField } from "@/features/purchase-requests/components/composites/PurchaseRequestNeededDateField"
import { PurchaseRequestNoteField } from "@/features/purchase-requests/components/composites/PurchaseRequestNoteField"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestDetailHeaderProps = {
  purchaseRequest: PurchaseRequestDetail
  itemCount: number
}

// Chỉ có 1 đường ghi vào purchase_requests hiện nay — ProductionJobsService.startJob — nên có
// productionJob/productionOrder nghĩa là đề xuất tự sinh từ đó; ngược lại là thủ công (tương lai,
// xem docs/domains/purchase-requests.md ở backend).
const getSourceLabel = ({
  productionJob,
  productionOrder,
}: PurchaseRequestDetail): string =>
  productionJob || productionOrder ? "Từ Job/PO" : "Thủ công"

function getApprovalMeta(purchaseRequest: PurchaseRequestDetail): {
  label: string
  value: ReactNode
} {
  switch (purchaseRequest.status) {
    case PurchaseRequestStatus.APPROVED:
      return {
        label: "Người duyệt",
        value: purchaseRequest.approverBy ? (
          <span>
            {purchaseRequest.approverBy.fullName}
            {purchaseRequest.approvedAt && (
              <span className="ml-1 text-xs text-muted-foreground">
                (
                {DateTime.fromISO(purchaseRequest.approvedAt).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
                )
              </span>
            )}
          </span>
        ) : (
          "—"
        ),
      }
    case PurchaseRequestStatus.PENDING_APPROVAL:
      return {
        label: "Người gửi duyệt",
        value: purchaseRequest.senderBy ? (
          <span>
            {purchaseRequest.senderBy.fullName}
            {purchaseRequest.sentAt && (
              <span className="ml-1 text-xs text-muted-foreground">
                (
                {DateTime.fromISO(purchaseRequest.sentAt).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
                )
              </span>
            )}
          </span>
        ) : (
          "—"
        ),
      }
    case PurchaseRequestStatus.REJECTED:
      return {
        label: "Người từ chối",
        value: purchaseRequest.rejecterBy ? (
          <span>
            {purchaseRequest.rejecterBy.fullName}
            {purchaseRequest.rejectedAt && (
              <span className="ml-1 text-xs text-muted-foreground">
                (
                {DateTime.fromISO(purchaseRequest.rejectedAt).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
                )
              </span>
            )}
          </span>
        ) : (
          "—"
        ),
      }
    case PurchaseRequestStatus.DRAFT:
    default:
      return {
        label: "Phê duyệt",
        value: (
          <span className="text-muted-foreground italic">Chưa gửi duyệt</span>
        ),
      }
  }
}

// Identity + info row, same single-block idiom as ProductionJobDetailHeader.tsx —
// `itemCount` is a prop (not `purchaseRequest.items.length`) so "Tổng số vật tư" tracks the page's own
// editable row list (a vật tư removed locally shouldn't still count here).
export function PurchaseRequestDetailHeader({
  purchaseRequest,
  itemCount,
}: PurchaseRequestDetailHeaderProps) {
  const source = getSourceLabel(purchaseRequest)
  const approvalMeta = getApprovalMeta(purchaseRequest)

  const totalQuantity = purchaseRequest.items.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  )
  const formattedTotalQuantity = new Intl.NumberFormat("vi-VN").format(
    totalQuantity
  )

  return (
    <div className="flex flex-col gap-5 px-4 py-4 sm:px-5 print:hidden">
      {/* Hàng tiêu đề và các nút tác vụ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/purchase-requests"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đề xuất mua hàng"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-xl font-bold tracking-tight text-foreground">
            {purchaseRequest.code}
          </span>
          <PurchaseRequestStatusBadge status={purchaseRequest.status} />
        </div>

        <PurchaseRequestDetailActions purchaseRequest={purchaseRequest} />
      </div>

      {/* Lưới thông tin và ghi chú chia 4 cột cân đối */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hàng 1: Nguồn gốc & Liên kết */}
        <MetaField label="Nguồn" value={source} />
        <MetaField
          label="LSX liên quan"
          value={
            purchaseRequest.productionOrder ? (
              <Link
                to="/manage/production-orders/$productionOrderId"
                params={{
                  productionOrderId: purchaseRequest.productionOrder.id,
                }}
                className="font-mono text-primary hover:underline"
              >
                {purchaseRequest.productionOrder.code ?? "—"}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <MetaField
          label="Job liên quan"
          value={
            purchaseRequest.productionJob ? (
              <Link
                to="/manage/production-jobs/$productionJobId"
                params={{
                  productionJobId: purchaseRequest.productionJob.id,
                }}
                search={{ tab: "info" }}
                className="font-mono text-primary hover:underline"
              >
                {purchaseRequest.productionJob.code ?? "—"}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <MetaField
          label="Bộ phận đề xuất"
          value={purchaseRequest.department.name}
        />

        {/* Hàng 2: Nhân sự & Thời gian & Duyệt */}
        <MetaField
          label="Người tạo"
          value={purchaseRequest.requesterBy?.fullName ?? "—"}
        />
        <MetaField
          label="Ngày tạo"
          value={DateTime.fromISO(purchaseRequest.createdAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
        <PurchaseRequestNeededDateField
          purchaseRequestId={purchaseRequest.id}
          neededDate={purchaseRequest.neededDate}
          status={purchaseRequest.status}
        />
        <MetaField label={approvalMeta.label} value={approvalMeta.value} />

        {/* Hàng 3: Số liệu vật tư & Ghi chú */}
        <MetaField label="Số loại vật tư" value={`${itemCount} loại`} />
        <MetaField label="Tổng SL đề xuất" value={formattedTotalQuantity} />
        <div className="sm:col-span-2 lg:col-span-2">
          <PurchaseRequestNoteField
            purchaseRequestId={purchaseRequest.id}
            note={purchaseRequest.note}
          />
        </div>
      </div>
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

// Same label-above-value tile idiom as ProductionOrderDetailSummaryCard.tsx's MetaField — more
// scannable than the previous inline "label: value" list, and reuses an existing identity-block
// pattern instead of inventing a new one.
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
