import { Eye } from "lucide-react"

import { DisabledAction } from "@/components/shared/DisabledAction"

// No route/API for a detail screen yet — disabled, not linked.
export function PurchaseQuotationActionsCell() {
  return (
    <div className="flex items-center justify-center">
      <DisabledAction label="Xem chi tiết">
        <Eye className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
