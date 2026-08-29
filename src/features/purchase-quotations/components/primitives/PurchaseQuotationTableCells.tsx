import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

type PurchaseQuotationActionsCellProps = {
  purchaseQuotationId: string
}

// "Xem chi tiết" now has a real route — see PurchaseQuotationDetailPage.
export function PurchaseQuotationActionsCell({
  purchaseQuotationId,
}: PurchaseQuotationActionsCellProps) {
  return (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
        asChild
      >
        <Link
          to="/manage/purchase-quotations/$purchaseQuotationId"
          params={{ purchaseQuotationId }}
        >
          <Eye className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}
