import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft, Diskette } from "@solar-icons/react"
import { ClipboardCheck } from "lucide-react"
import type { ReactNode } from "react"

import { Button, LinkButton } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/primitives/ProductionJobBadges"
import { ProductionJobDetailTabs } from "@/features/production-jobs/components/layouts/ProductionJobDetailTabs"
import { RequestProductionJobQcDialog } from "@/features/production-jobs/components/composites/RequestProductionJobQcDialog"
import { StartProductionJobDialog } from "@/features/production-jobs/components/composites/StartProductionJobDialog"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobDetailHeaderProps = {
  productionJob: ProductionJobDetail
}

// Identity, the header facts and the tab strip read as one unit, so they share a single block
// like ProductDetailHeader.tsx. 2 action buttons side by side (once the viewer has the matching
// permission), following the one-way lifecycle PENDING → IN_PROGRESS → WAITING_QC →
// WAITING_DELIVERY → COMPLETED (docs/decisions/production-lifecycle-closing.md, backend repo):
// "Xác nhận" (start, hidden outside PENDING — the only action that starts production, and now
// the only one needed: the backend's separate "duyệt công đoạn" step was removed 2026-09-03, so
// operation-quantity entry unlocks the moment the Job is IN_PROGRESS, no extra confirm), "Yêu
// cầu OQC" (disabled outside WAITING_QC). Only "Yêu cầu OQC" stays always-rendered+disabled —
// "Xác nhận" hides instead, and there is no "Nhập kho thành phẩm" button here: the backend
// auto-generates the FG receipt at PENDING_RECEIPT the moment OQC coverage closes the Job
// (closeJobIfQcCovered, backend repo) — kho only opens that receipt's detail page to `post` it,
// there is no manual create screen left to deep-link to. No client-side gate beyond each
// button's own disabledReason — the backend enforces every precondition
// (E213/E214/E196/E197/...) and each dialog surfaces its own error inline.
export function ProductionJobDetailHeader({
  productionJob,
}: ProductionJobDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton
              to="/manage/production-jobs"
              search={{ page: 1, limit: 10 }}
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại danh sách Job"
            >
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </LinkButton>

            <span className="font-mono text-lg font-bold text-foreground">
              {productionJob.code}
            </span>
            <ProductionJobStatusBadge status={productionJob.status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-3">
            <InfoField
              label="Sản phẩm"
              value={
                <Link
                  to="/manage/products/$productId"
                  params={{ productId: productionJob.itemId }}
                  search={{ tab: "info" }}
                  className="text-primary hover:underline"
                >
                  {productionJob.item.code} — {productionJob.item.name}
                </Link>
              }
            />
            <InfoField
              label="SL sản xuất"
              value={`${productionJob.quantity} Bộ`}
            />
            <InfoField
              label="PO / HĐ"
              value={
                <Link
                  to="/manage/orders/$orderId"
                  params={{ orderId: productionJob.order.id }}
                  className="text-primary hover:underline"
                >
                  {productionJob.order.code}
                </Link>
              }
              mono
            />
            <InfoField
              label="Khách hàng"
              value={productionJob.client?.name ?? "—"}
            />
            <InfoField
              label="Ngày tạo"
              value={DateTime.fromISO(productionJob.createdAt).toFormat(
                "dd/MM/yyyy"
              )}
            />
            <InfoField
              label="Ngày giao hàng"
              value={
                productionJob.order.dueDate === null
                  ? "—"
                  : DateTime.fromISO(productionJob.order.dueDate).toFormat(
                      "dd/MM/yyyy"
                    )
              }
            />
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission="production:update">
            <StartJobButton job={productionJob} />
          </PermissionGate>

          <PermissionGate permission="oqc:create">
            <RequestOqcButton job={productionJob} />
          </PermissionGate>
        </div>
      </div>

      <ProductionJobDetailTabs />
    </>
  )
}

// Khác RequestOqcButton — ẩn hẳn (không disable) ngoài PENDING, theo đúng yêu cầu chỉ giữ
// disable-not-hide cho "Yêu cầu OQC".
function StartJobButton({ job }: { job: ProductionJobDetail }) {
  if (job.status !== ProductionJobStatus.PENDING) {
    return null
  }

  return (
    <StartProductionJobDialog
      job={job}
      trigger={
        <Button type="button" className="gap-1.5">
          <Diskette className="size-4" />
          Xác nhận
        </Button>
      }
    />
  )
}

// Disabled (not hidden) outside WAITING_QC or once Job đã có phiếu OQC nào (`job.oqcRequested`,
// ProductionJobDetailResDto — BE chặn tạo lần 2 cho cùng công đoạn Cấp 0, E198). Đọc thẳng từ chi
// tiết Job đã fetch sẵn, không gọi thêm API list riêng. A plain <Button disabled> swallows pointer
// events so the Tooltip needs the <span> wrapper trick to still fire.
function RequestOqcButton({ job }: { job: ProductionJobDetail }) {
  const disabledReason =
    job.status !== ProductionJobStatus.WAITING_QC
      ? "Chỉ yêu cầu OQC được khi Job đã xong công đoạn (chờ QC)."
      : job.oqcRequested
        ? "Job này đã được tạo phiếu OQC."
        : null

  const button = (
    <Button
      type="button"
      className="gap-1.5"
      isDisabled={disabledReason !== null}
    >
      <ClipboardCheck className="size-4" />
      {job.oqcRequested ? "Đã tạo OQC" : "Yêu cầu OQC"}
    </Button>
  )

  if (disabledReason === null) {
    return <RequestProductionJobQcDialog job={job} trigger={button} />
  }

  return (
    <TooltipTrigger>
      <span className="inline-block">{button}</span>
      <Tooltip>{disabledReason}</Tooltip>
    </TooltipTrigger>
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
