import { useState } from "react"
import { DateTime } from "luxon"

import { DatePicker } from "@/components/shared/composites/DatePicker"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUpdateJobOperationDueDate } from "@/features/production-jobs/api"
import { ProductionJobStatus } from "@/lib/types/production-job.type"

type JobOperationDueDateCellProps = {
  productionJobId: string
  jobOperationId: string
  dueDate: string | null
  disabledReason: string | null
}

export function formatJobOperationDueDate(dueDate: string | null): string {
  return dueDate === null
    ? "—"
    : DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
}

// Ô hạn hoàn thành công đoạn — DatePicker inline, commit ngay trong onChange (cùng lý do
// PurchaseOrderExpectedDateField.tsx: date picker không có rủi ro mất focus theo từng phím).
// Dùng chung bởi 2 màn (production-jobs' tab "Công đoạn sản xuất" và production-execution' màn
// "Thực hiện sản xuất") — cùng entity, cùng mutation, không prop biến thể, xem
// .claude/rules/ui-kit.md. `productionJobId` bắt buộc là prop (không useParams) vì 2 màn ở 2 route
// khác nhau. `disabledReason` chỉ phản ánh trạng thái Job (PENDING/không còn IN_PROGRESS) — quyền
// `production:update` được gate riêng ở call site qua PermissionGate, fallback render cùng dạng
// chỉ đọc bằng formatJobOperationDueDate.
export function JobOperationDueDateCell({
  productionJobId,
  jobOperationId,
  dueDate,
  disabledReason,
}: JobOperationDueDateCellProps) {
  const [value, setValue] = useState(dueDate ?? "")
  const { mutate: save } = useUpdateJobOperationDueDate()

  if (disabledReason !== null) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-block text-muted-foreground">
              {formatJobOperationDueDate(dueDate)}
            </span>
          }
        />
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DatePicker
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue)
        if (nextValue.length === 0) return

        save(
          { productionJobId, jobOperationId, dueDate: nextValue },
          { onError: () => setValue(dueDate ?? "") }
        )
      }}
    />
  )
}

// Chỉ gate theo trạng thái Job — khác resolveJobOperationReportDisabledReason, KHÔNG chặn
// OUTSOURCE: hạn là kế hoạch điều độ, không phải số liệu tự ghi từ OS-IN.
export function resolveJobOperationDueDateDisabledReason(
  jobStatus: ProductionJobStatus
): string | null {
  if (jobStatus === ProductionJobStatus.PENDING) {
    return 'Job chưa bắt đầu sản xuất — bấm "Xác nhận" ở trang Quản lý sản xuất trước.'
  }
  if (jobStatus !== ProductionJobStatus.IN_PROGRESS) {
    return "Job đã hoàn thành mọi công đoạn — không đặt được hạn."
  }
  return null
}
