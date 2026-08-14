import { useRef } from "react"
import { Printer } from "lucide-react"
import { DateTime } from "luxon"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getMockOutboundOrder } from "@/features/outbound-orders/mock/outbound-orders.mock"
import { outboundDeliveryMethodLabels } from "@/lib/types/outbound-order.type"

type OutboundOrderPrintDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function OutboundOrderPrintDialog({
  open,
  onOpenChange,
  orderId,
}: OutboundOrderPrintDialogProps) {
  const detail = getMockOutboundOrder(orderId)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  if (!detail) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            Bản in - Phiếu giao hàng ({detail.code})
          </DialogTitle>
        </DialogHeader>

        {/* Printable Area */}
        <div
          ref={printRef}
          className="my-2 space-y-4 rounded-md border border-border bg-card p-6 text-sm text-card-foreground shadow-inner"
        >
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-primary uppercase">
                CƠ KHÍ TIẾN HUY
              </h2>
              <p className="text-xs text-muted-foreground">
                Hệ thống Quản trị Sản xuất ERP
              </p>
            </div>
            <div className="text-right font-mono">
              <p className="text-base font-bold">{detail.code}</p>
              <p className="text-xs text-muted-foreground">
                {DateTime.fromISO(detail.createdAt).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
          </div>

          <div className="py-2 text-center">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              PHIẾU GIAO HÀNG (DELIVERY ORDER)
            </h1>
            <p className="text-xs text-muted-foreground italic">
              Hình thức: {outboundDeliveryMethodLabels[detail.deliveryMethod]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <p>
              <strong className="font-semibold">Khách hàng:</strong>{" "}
              {detail.clientName}
            </p>
            <p>
              <strong className="font-semibold">PO / Lý do:</strong>{" "}
              {detail.poOrReason}
            </p>
            <p>
              <strong className="font-semibold">Địa chỉ giao:</strong>{" "}
              {detail.deliveryAddress ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">Tài xế / SĐT:</strong>{" "}
              {detail.driverName
                ? `${detail.driverName} (${detail.driverPhone})`
                : "—"}
            </p>
            {detail.note && (
              <p className="col-span-2">
                <strong className="font-semibold">Ghi chú:</strong>{" "}
                {detail.note}
              </p>
            )}
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-border text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-center">STT</th>
                <th className="border border-border p-2 text-left">Mã SP</th>
                <th className="border border-border p-2 text-left">
                  Tên sản phẩm
                </th>
                <th className="border border-border p-2 text-center">ĐVT</th>
                <th className="border border-border p-2 text-right">SL Giao</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border border-border p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-border p-2 font-mono">
                    {item.productCode}
                  </td>
                  <td className="border border-border p-2">
                    {item.productName}
                  </td>
                  <td className="border border-border p-2 text-center">
                    {item.unit}
                  </td>
                  <td className="border border-border p-2 text-right font-semibold">
                    {item.deliveredQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
            <div>
              <p className="font-semibold">Người lập phiếu</p>
              <p className="mt-12 text-muted-foreground">
                {detail.createdByName ?? "(Ký tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Người vận chuyển</p>
              <p className="mt-12 text-muted-foreground">
                {detail.driverName ?? "(Ký tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Người nhận hàng</p>
              <p className="mt-12 text-muted-foreground">
                (Ký & ghi rõ họ tên)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 size-4" />
            In phiếu DO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
