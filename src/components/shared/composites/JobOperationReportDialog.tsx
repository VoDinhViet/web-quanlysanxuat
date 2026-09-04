import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { JobOperationReportForm } from "@/components/shared/composites/JobOperationReportForm"
import { OperationType } from "@/lib/types/operation.type"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { JobOperationReportRow } from "@/lib/types/production-job.type"

type JobOperationReportDialogProps = {
  row: JobOperationReportRow
  disabledReason: string | null
  trigger: ReactNode
}

// Bấm "Nhập báo cáo" ở một dòng → mở dialog nhập ngay cho đúng công đoạn của dòng đó. Dialog
// unmounts nội dung khi đóng, nên form (và state mutation của nó) luôn khởi tạo mới mỗi lần mở,
// cùng idiom OutboundOrderRejectDialog.tsx.
//
// Dùng chung bởi 2 màn (production-execution's "DANH SÁCH PART" và production-jobs' "Công đoạn
// sản xuất") — cả hai render đúng 1 entity (`ProductionJobOperation`), 1 mutation, không có prop
// biến thể nào giữa 2 nơi gọi (xem ghi chú trong .claude/rules/ui-kit.md). Data layer (schema/
// server-function/mutation hook) ở lại `production-jobs` (chủ sở hữu entity); component này gọi
// ngược qua `@/features/production-jobs/api` — đúng
// `qlsx/shared-reads-features-through-the-barrel` (eslint.config.js), cùng khuôn `useLogout`
// (`@/features/auth/api`) mà PageTitleBar.tsx đang dùng.
export function JobOperationReportDialog({
  row,
  disabledReason,
  trigger,
}: JobOperationReportDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="sm:max-w-xl">
        <JobOperationReportForm
          row={row}
          disabledReason={disabledReason}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}

// Gộp 2 tầng lý do khoá đang tách rời trước migration này: job-level (Job chưa `start`/đã xong)
// và row-level (công đoạn OUTSOURCE tự cập nhật qua OS-IN, không nhập tay) — ưu tiên job-level
// trước, đúng thứ tự cũ ở ProductionExecutionPartsTableColumns.tsx.
export function resolveJobOperationReportDisabledReason(
  jobStatus: ProductionJobStatus,
  operationType: OperationType
): string | null {
  if (jobStatus === ProductionJobStatus.PENDING) {
    return 'Job chưa bắt đầu sản xuất — bấm "Xác nhận" ở trang Quản lý sản xuất trước.'
  }
  if (jobStatus !== ProductionJobStatus.IN_PROGRESS) {
    return "Job đã hoàn thành mọi công đoạn — không thể báo cáo thêm."
  }
  if (operationType === OperationType.OUTSOURCE) {
    return "Công đoạn gia công ngoài tự cập nhật khi nhận hàng (OS-IN), không nhập tay."
  }
  return null
}
