import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProductionOperationSummary } from "@/lib/types/production-job.type"

type OperationSelectProps = {
  summary: ProductionOperationSummary[]
  selectedOperationId: string | undefined
  isPending: boolean
  isError?: boolean
}

// "CHỌN CÔNG ĐOẠN" — sau vài lượt thử thẻ/chip màu (quá to, rồi vẫn không vừa mắt), chốt lại
// bằng một Select thường: đây vốn chỉ là 1 bộ lọc (chọn 1 trong N công đoạn), không cần trọng
// lượng thị giác của thẻ/card. Ghép chung 1 hàng với các ô lọc khác — xem
// ProductionExecutionJobsTableFilter.tsx, nơi component này được dùng làm ô lọc đầu tiên.
export function OperationSelect({
  summary,
  selectedOperationId,
  isPending,
  isError,
}: OperationSelectProps) {
  const navigate = useNavigate({ from: "/manage/production-execution" })

  const handleChange = (operationId: string) => {
    void navigate({
      search: (prev) => ({ ...prev, operationId, page: 1 }),
    })
  }

  const placeholder = isPending
    ? "Đang tải..."
    : isError
      ? "Không tải được danh sách"
      : "Không có công đoạn nào"

  return (
    <Select
      value={selectedOperationId ?? ""}
      onChange={(key) => handleChange(String(key))}
      isDisabled={isPending || isError || summary.length === 0}
      placeholder={placeholder}
    >
      <SelectTrigger
        id="production-execution-operation"
        className="w-full text-xs"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {summary.map((operation) => (
          <SelectItem
            key={operation.operationId}
            id={operation.operationId}
            className="text-xs"
          >
            {operation.name} · {operation.jobCount} công việc
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
