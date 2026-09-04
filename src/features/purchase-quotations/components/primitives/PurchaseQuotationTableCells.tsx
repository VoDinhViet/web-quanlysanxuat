import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"

type PurchaseQuotationActionsCellProps = {
  purchaseQuotationId: string
}

// "Xem chi tiết" now has a real route — see PurchaseQuotationDetailPage.
export function PurchaseQuotationActionsCell({
  purchaseQuotationId,
}: PurchaseQuotationActionsCellProps) {
  return (
    <div className="flex items-center justify-center">
      <LinkButton
        to="/manage/purchase-quotations/$purchaseQuotationId"
        params={{ purchaseQuotationId }}
        variant="outline"
        size="icon-sm"
        aria-label="Xem chi tiết"
        className="bg-background text-muted-foreground"
      >
        <Eye className="size-3.5" />
      </LinkButton>
    </div>
  )
}
