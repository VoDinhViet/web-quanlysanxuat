import { Diskette, Refresh } from "@solar-icons/react"
import { Calendar, ClipboardCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { PlanProductionJobDialog } from "@/features/production-jobs/components/composites/PlanProductionJobDialog"
import { ReloadProductionJobSnapshotDialog } from "@/features/production-jobs/components/composites/ReloadProductionJobSnapshotDialog"
import { RequestProductionJobQcDialog } from "@/features/production-jobs/components/composites/RequestProductionJobQcDialog"
import { StartProductionJobDialog } from "@/features/production-jobs/components/composites/StartProductionJobDialog"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobHeaderActionsProps = {
  job: ProductionJobDetail
}

// Actions follow the one-way lifecycle PENDING → IN_PROGRESS → WAITING_QC → WAITING_DELIVERY →
// COMPLETED. Order: secondary (outline) first, the one primary action of the current status last.
// "Tải lại"/"Xác nhận" hide outside PENDING and "Lập kế hoạch" outside IN_PROGRESS; only "Yêu cầu
// OQC" stays always-rendered + disabled. The backend enforces every precondition and each dialog
// surfaces its own error inline, so there is no client-side gate beyond each button's own reason.
export function ProductionJobHeaderActions({
  job,
}: ProductionJobHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission="production:update">
        <ReloadSnapshotButton job={job} />
        <StartJobButton job={job} />
        <PlanJobButton job={job} />
      </PermissionGate>

      <PermissionGate permission="oqc:create">
        <RequestOqcButton job={job} />
      </PermissionGate>
    </div>
  )
}

function PlanJobButton({ job }: { job: ProductionJobDetail }) {
  if (job.status !== ProductionJobStatus.IN_PROGRESS) {
    return null
  }

  return (
    <PlanProductionJobDialog
      job={job}
      trigger={
        <Button type="button" className="gap-1.5">
          <Calendar className="size-4" />
          Lập kế hoạch
        </Button>
      }
    />
  )
}

function ReloadSnapshotButton({ job }: { job: ProductionJobDetail }) {
  if (job.status !== ProductionJobStatus.PENDING) {
    return null
  }

  return (
    <ReloadProductionJobSnapshotDialog
      job={job}
      trigger={
        <Button
          type="button"
          variant="outline"
          className="gap-1.5 border-primary/30 bg-primary/5 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          <Refresh className="size-4" />
          Tải lại
        </Button>
      }
    />
  )
}

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
          Xác nhận kế hoạch
        </Button>
      }
    />
  )
}

// Disabled (not hidden) khi Job chưa/không còn ở trạng thái sản xuất hoặc chưa có SL hoàn thành mới
// để kiểm (`job.oqcRequestableQuantity`, OQC theo lô một phần — BE chặn SL lô vượt số này, E198). A
// plain <Button disabled> swallows pointer events so the Tooltip needs the <span> wrapper trick to
// still fire.
function RequestOqcButton({ job }: { job: ProductionJobDetail }) {
  const canRequest =
    job.status === ProductionJobStatus.IN_PROGRESS ||
    job.status === ProductionJobStatus.WAITING_QC
  const disabledReason = !canRequest
    ? "Chỉ yêu cầu OQC được khi Job đang sản xuất hoặc chờ QC."
    : job.oqcRequestableQuantity <= 0
      ? "Chưa có SL hoàn thành mới ở công đoạn cuối để kiểm."
      : null

  const button = (
    <Button
      type="button"
      className="gap-1.5"
      disabled={disabledReason !== null}
    >
      <ClipboardCheck className="size-4" />
      Yêu cầu OQC
    </Button>
  )

  if (disabledReason === null) {
    return <RequestProductionJobQcDialog job={job} trigger={button} />
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block">{button}</span>} />
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}
