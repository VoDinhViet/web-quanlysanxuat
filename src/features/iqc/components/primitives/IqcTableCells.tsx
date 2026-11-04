import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"

// "PO / Lý do" — theo docs/domains/quality.md: có PO thì hiện mã PO, không thì hiện lý do tự do
// (reason, free text). Cả hai cùng null là biên hiếm (seed luôn set reason khi không có PO).
type IqcPoOrReasonCellProps = {
  purchaseOrder: { id: string; code: string } | null
  reason: string | null
}

export function IqcPoOrReasonCell({
  purchaseOrder,
  reason,
}: IqcPoOrReasonCellProps) {
  if (purchaseOrder) {
    return (
      <span className="font-mono text-xs font-medium text-primary">
        {purchaseOrder.code}
      </span>
    )
  }

  if (reason) {
    return <span className="text-xs text-foreground">{reason}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

type IqcActionsCellProps = {
  iqcId: string
}

// The only way to change a row after creation is the confirm-QC flow on the detail page, so there
// is no free-form edit action here.
export function IqcActionsCell({ iqcId }: IqcActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <LinkButton
        to="/manage/iqc/$iqcId"
        params={{ iqcId }}
        variant="outline"
        size="icon-sm"
        aria-label="Xem chi tiết"
        className="bg-card text-muted-foreground"
      >
        <Eye className="size-3.5" />
      </LinkButton>
    </div>
  )
}
