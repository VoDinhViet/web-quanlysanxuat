import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"

const amountFormatter = new Intl.NumberFormat("vi-VN")

// Formats a VND amount — same idiom as PurchaseOrderAmountCell.
export function PaymentRequestAmountCell({ value }: { value: number }) {
  return <span className="tabular-nums">{amountFormatter.format(value)}</span>
}

// Icon action button with tooltip linking to the detail page (mirroring users table pattern).
export function PaymentRequestActionsCell({
  paymentRequestId,
}: {
  paymentRequestId: string
}) {
  return (
    <div className="flex items-center justify-center">
      <RoutePermissionGate route="/manage/payment-requests/$paymentRequestId">
        <Tooltip>
          <TooltipTrigger
            render={
              <LinkButton
                to="/manage/payment-requests/$paymentRequestId"
                params={{ paymentRequestId }}
                variant="outline"
                size="icon-sm"
                aria-label="Xem chi tiết"
                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
              >
                <Eye className="size-3.5" />
              </LinkButton>
            }
          />
          <TooltipContent>Xem chi tiết</TooltipContent>
        </Tooltip>
      </RoutePermissionGate>
    </div>
  )
}
