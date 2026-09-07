import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const amountFormatter = new Intl.NumberFormat("vi-VN")

// Formats a VND amount — same idiom as PurchaseOrderAmountCell.
export function PaymentRequestAmountCell({ value }: { value: number }) {
  return <span className="tabular-nums">{amountFormatter.format(value)}</span>
}

// Three-dot action menu linking to the detail page.
export function PaymentRequestActionsCell({
  paymentRequestId,
}: {
  paymentRequestId: string
}) {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Thao tác"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLinkItem
            to="/manage/payment-requests/$paymentRequestId"
            params={{ paymentRequestId }}
          >
            Xem chi tiết
          </DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
