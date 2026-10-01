import { useRef, useState } from "react"
import { NumericFormat } from "react-number-format"

import { Input } from "@/components/ui/input"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { useUpdateProductionJobIssue } from "@/features/production-jobs/api/use-update-production-job-issue"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionJobIssueQuantityCellProps = {
  productionJobId: string
  issue: ProductionJobIssue
  // Job PENDING: ô nhập sửa được; còn lại chỉ đọc.
  isEditable: boolean
}

// Ô "SL cần" sửa ngay trên bảng. Lưu khi rời ô hoặc nhấn Enter (không lưu theo từng phím — mỗi
// phím gọi API sẽ mất focus giữa chừng); Esc bỏ thay đổi. Số lượng không hợp lệ (trống, <= 0) hoặc
// không đổi thì không gọi API, ô trở về số hiện tại.
export function ProductionJobIssueQuantityCell({
  productionJobId,
  issue,
  isEditable,
}: ProductionJobIssueQuantityCellProps) {
  const readOnly = (
    <span className="font-medium text-foreground tabular-nums">
      {quantityFormatter.format(issue.requiredQty)}
    </span>
  )

  if (!isEditable) return readOnly

  return (
    <PermissionGate permission="production:update" fallback={readOnly}>
      <QuantityInput productionJobId={productionJobId} issue={issue} />
    </PermissionGate>
  )
}

type QuantityInputProps = Pick<
  ProductionJobIssueQuantityCellProps,
  "productionJobId" | "issue"
>

function QuantityInput({ productionJobId, issue }: QuantityInputProps) {
  // `null` = không đang sửa, hiển thị số từ server; có giá trị = bản nháp người dùng đang gõ.
  const [draft, setDraft] = useState<number | undefined | null>(null)
  // Esc blur ô trước khi state kịp về `null` — cờ này báo cho `commit` biết là bỏ, không lưu.
  const isCancelled = useRef(false)
  const { mutate: save, isPending } = useUpdateProductionJobIssue()

  const commit = () => {
    if (isCancelled.current) {
      isCancelled.current = false
      return
    }
    if (draft === null) return
    const isValid = draft !== undefined && draft > 0
    if (!isValid || draft === issue.requiredQty) {
      setDraft(null)
      return
    }

    save(
      { productionJobId, issueId: issue.id, requiredQty: draft },
      { onSettled: () => setDraft(null) }
    )
  }

  return (
    <NumericFormat
      customInput={Input}
      aria-label={`Số lượng cần của ${issue.item.code}`}
      className="h-8 w-28 text-right text-xs tabular-nums"
      value={draft === null ? issue.requiredQty : (draft ?? "")}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      disabled={isPending}
      onValueChange={(values, source) => {
        // Bỏ qua lần đồng bộ do prop `value` đổi, chỉ nhận thao tác gõ của người dùng.
        if (source.source === "event") setDraft(values.floatValue)
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur()
        if (event.key === "Escape") {
          isCancelled.current = true
          setDraft(null)
          event.currentTarget.blur()
        }
      }}
    />
  )
}
