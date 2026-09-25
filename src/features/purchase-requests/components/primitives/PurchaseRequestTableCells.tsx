import { CircleCheck, CircleX, Eye, Printer, Send } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { ApprovePurchaseRequestDialog } from "@/features/purchase-requests/components/composites/ApprovePurchaseRequestDialog"
import { RejectPurchaseRequestDialog } from "@/features/purchase-requests/components/composites/RejectPurchaseRequestDialog"
import { SendPurchaseRequestDialog } from "@/features/purchase-requests/components/composites/SendPurchaseRequestDialog"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type {
  PurchaseRequest,
  PurchaseRequestProductionOrderRef,
} from "@/lib/types/purchase-request.type"

// "PO liên quan / Lý do": a request auto-generated from a LSX shows its production order code; a
// manually-created request that got rejected shows why; anything else (manual + not rejected)
// genuinely has neither, so it's a plain "—" rather than a placeholder.
export function PurchaseRequestSourceCell({
  productionOrder,
  status,
  rejectionReason,
}: {
  productionOrder: PurchaseRequestProductionOrderRef | null
  status: PurchaseRequestStatus
  rejectionReason: string | null
}) {
  if (productionOrder) {
    return productionOrder.code === null ? (
      <span>—</span>
    ) : (
      <span className="font-mono font-semibold text-primary">
        {productionOrder.code}
      </span>
    )
  }

  if (status === PurchaseRequestStatus.REJECTED && rejectionReason) {
    return <span>{rejectionReason}</span>
  }

  return <span>—</span>
}

type PurchaseRequestActionsCellProps = {
  purchaseRequest: PurchaseRequest
}

// "Xem chi tiết" links to the real detail route; Gửi duyệt/Duyệt/Từ chối follow the same
// status/permission rules as PurchaseRequestApprovalActions.tsx, and In has no backend route yet.
// No "Chỉnh sửa" — the backend has no generic header-update endpoint (no PATCH
// /purchase-requests/:id) to power an edit screen.
export function PurchaseRequestActionsCell({
  purchaseRequest,
}: PurchaseRequestActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <LinkButton
        to="/manage/purchase-requests/$purchaseRequestId"
        params={{ purchaseRequestId: purchaseRequest.id }}
        variant="outline"
        size="icon-sm"
        className="bg-background text-muted-foreground"
        aria-label="Xem chi tiết"
      >
        <Eye className="size-3.5" />
      </LinkButton>
      {purchaseRequest.status === PurchaseRequestStatus.DRAFT && (
        <PermissionGate permission="purchase-requests:update">
          <Tooltip>
            <SendPurchaseRequestDialog
              purchaseRequest={purchaseRequest}
              trigger={
                <TooltipTrigger
                  render={
                    <Button type="button" size="icon-sm" aria-label="Gửi duyệt">
                      <Send className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Gửi duyệt</TooltipContent>
          </Tooltip>
        </PermissionGate>
      )}
      {purchaseRequest.status === PurchaseRequestStatus.PENDING_APPROVAL && (
        <PermissionGate permission="purchase-requests:approve">
          <Tooltip>
            <RejectPurchaseRequestDialog
              purchaseRequest={purchaseRequest}
              trigger={
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Từ chối"
                    >
                      <CircleX className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Từ chối</TooltipContent>
          </Tooltip>
          <Tooltip>
            <ApprovePurchaseRequestDialog
              purchaseRequest={purchaseRequest}
              trigger={
                <TooltipTrigger
                  render={
                    <Button type="button" size="icon-sm" aria-label="Duyệt">
                      <CircleCheck className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Duyệt</TooltipContent>
          </Tooltip>
        </PermissionGate>
      )}
      <DisabledAction label="In" hint="chưa hỗ trợ in phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
