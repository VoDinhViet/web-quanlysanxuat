import { format, parseISO } from "date-fns"
import { Receipt } from "lucide-react"
import type { ReactNode } from "react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { OutboundOrderInvoiceStatusBadge } from "@/features/outbound-orders/components/primitives/OutboundOrderBadges"
import { OutboundOrderInvoiceDialog } from "@/features/outbound-orders/components/composites/OutboundOrderInvoiceDialog"
import { vnZone } from "@/lib/time"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderInvoiceCardProps = {
  order: OutboundOrderDetail
}

// Chỉ DO đã giao mới có hóa đơn (backend chặn ở lỗi E320), nên card ẩn với các trạng thái còn lại.
export function OutboundOrderInvoiceCard({
  order,
}: OutboundOrderInvoiceCardProps) {
  if (order.status !== OutboundOrderStatus.DELIVERED) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-medium tracking-tight text-foreground sm:px-5">
        <Receipt className="size-4 text-muted-foreground" />
        Thông tin xuất hóa đơn
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <InvoiceField label="Trạng thái">
          <OutboundOrderInvoiceStatusBadge
            invoiceStatus={order.invoiceStatus}
          />
        </InvoiceField>
        <InvoiceField label="Số hóa đơn">{order.invoiceNo ?? "—"}</InvoiceField>
        <InvoiceField label="Ngày xuất hóa đơn">
          {order.invoiceDate
            ? format(parseISO(order.invoiceDate, { in: vnZone }), "dd/MM/yyyy")
            : "—"}
        </InvoiceField>
        {order.invoicerBy && (
          <InvoiceField label="Người cập nhật">
            {order.invoicerBy.fullName}
          </InvoiceField>
        )}

        <PermissionGate permission="outbound:invoice">
          <OutboundOrderInvoiceDialog
            order={order}
            trigger={
              <Button type="button" variant="outline" className="w-full">
                <Receipt className="size-4" />
                Cập nhật hóa đơn
              </Button>
            }
          />
        </PermissionGate>
      </div>
    </section>
  )
}

type InvoiceFieldProps = {
  label: string
  children: ReactNode
}

function InvoiceField({ label, children }: InvoiceFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  )
}
