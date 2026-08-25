import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft, Diskette } from "@solar-icons/react"
import { Box, CircleCheck, ClipboardCheck } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { ApproveProductionJobOperationsDialog } from "@/features/production-jobs/components/detail/ApproveProductionJobOperationsDialog"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/ProductionJobBadges"
import { ProductionJobDetailTabs } from "@/features/production-jobs/components/detail/ProductionJobDetailTabs"
import { RequestProductionJobQcDialog } from "@/features/production-jobs/components/detail/RequestProductionJobQcDialog"
import { StartProductionJobDialog } from "@/features/production-jobs/components/detail/StartProductionJobDialog"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobDetailHeaderProps = {
  detail: ProductionJobDetail
}

// Identity, the header facts and the tab strip read as one unit, so they share a single block
// like ProductDetailHeader.tsx. One action button per status, matching the one-way lifecycle
// PENDING → IN_PROGRESS → WAITING_QC → WAITING_DELIVERY → COMPLETED (docs/decisions/
// production-lifecycle-closing.md, backend repo): "Xác nhận" (start), "Yêu cầu QC" once
// WAITING_QC, "Nhập kho thành phẩm" once WAITING_DELIVERY (deep-links into create-from-job, which
// seeds its Job combobox from this id), nothing once COMPLETED — these three are hidden outside
// their status. "Duyệt công đoạn" is the one exception: always rendered once the viewer has
// `production:approve`, disabled (not hidden) outside IN_PROGRESS or once already approved
// (operationsApprovedAt set) — a Tooltip explains why, same idiom as
// ProductionJobOperationsTable.tsx's OperationSendActionCell. No client-side gate beyond the
// status switch itself — the backend enforces every precondition (E213/E214/E196/E197/E250/E251/
// ...) and each dialog/page surfaces its own error inline.
export function ProductionJobDetailHeader({
  detail,
}: ProductionJobDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại danh sách Job"
              asChild
            >
              <Link
                to="/manage/production-jobs"
                search={{ page: 1, limit: 10 }}
              >
                <AltArrowLeft className="size-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>
            </Button>

            <span className="font-mono text-lg font-bold text-foreground">
              {detail.code}
            </span>
            <ProductionJobStatusBadge status={detail.status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-3">
            <InfoField
              label="Sản phẩm"
              value={
                <Link
                  to="/manage/products/$productId"
                  params={{ productId: detail.itemId }}
                  search={{ tab: "info" }}
                  className="text-primary hover:underline"
                >
                  {detail.item.code} — {detail.item.name}
                </Link>
              }
            />
            <InfoField label="SL sản xuất" value={`${detail.quantity} Bộ`} />
            <InfoField
              label="PO / HĐ"
              value={
                <Link
                  to="/manage/orders/$orderId"
                  params={{ orderId: detail.order.id }}
                  className="text-primary hover:underline"
                >
                  {detail.order.code}
                </Link>
              }
              mono
            />
            <InfoField label="Khách hàng" value={detail.client?.name ?? "—"} />
            <InfoField
              label="Ngày tạo"
              value={DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy")}
            />
            <InfoField
              label="Ngày giao hàng"
              value={
                detail.order.dueDate === null
                  ? "—"
                  : DateTime.fromISO(detail.order.dueDate).toFormat(
                      "dd/MM/yyyy"
                    )
              }
            />
          </dl>
        </div>

        {detail.status === ProductionJobStatus.PENDING && (
          <PermissionGate permission="production:update">
            <StartProductionJobDialog
              job={detail}
              trigger={
                <Button type="button" className="gap-1.5">
                  <Diskette className="size-4" />
                  Xác nhận
                </Button>
              }
            />
          </PermissionGate>
        )}

        <PermissionGate permission="production:approve">
          <ApproveOperationsButton job={detail} />
        </PermissionGate>

        {detail.status === ProductionJobStatus.WAITING_QC && (
          <PermissionGate permission="oqc:create">
            <RequestProductionJobQcDialog
              job={detail}
              trigger={
                <Button type="button" className="gap-1.5">
                  <ClipboardCheck className="size-4" />
                  Yêu cầu QC
                </Button>
              }
            />
          </PermissionGate>
        )}

        {detail.status === ProductionJobStatus.WAITING_DELIVERY && (
          <PermissionGate permission="inventory:create">
            <Button type="button" className="gap-1.5" asChild>
              <Link
                to="/manage/inventory-receipts/create-from-job"
                search={{ productionJobId: detail.id }}
              >
                <Box className="size-4" />
                Nhập kho thành phẩm
              </Link>
            </Button>
          </PermissionGate>
        )}
      </div>

      <ProductionJobDetailTabs />
    </>
  )
}

// Disabled (not hidden) outside IN_PROGRESS or once already approved — a plain <Button disabled>
// swallows pointer events so the Tooltip needs the <span> wrapper trick to still fire, same idiom
// as ProductionJobOperationsTable.tsx's OperationSendActionCell.
function ApproveOperationsButton({ job }: { job: ProductionJobDetail }) {
  const disabledReason =
    job.status !== ProductionJobStatus.IN_PROGRESS
      ? "Chỉ duyệt được khi Job đang sản xuất."
      : job.operationsApprovedAt
        ? "Job này đã được duyệt công đoạn."
        : null

  const button = (
    <Button
      type="button"
      className="gap-1.5"
      disabled={disabledReason !== null}
    >
      <CircleCheck className="size-4" />
      Duyệt công đoạn
    </Button>
  )

  if (disabledReason === null) {
    return <ApproveProductionJobOperationsDialog job={job} trigger={button} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

function InfoField({ label, value, mono }: InfoFieldProps) {
  return (
    <div className="flex items-baseline gap-1.5 text-xs">
      <dt className="shrink-0 text-muted-foreground">{label}:</dt>
      <dd
        className={
          mono
            ? "truncate font-mono font-semibold text-foreground"
            : "truncate font-semibold text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
