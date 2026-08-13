import { useRef } from "react"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getMockInventoryReceipt } from "@/features/inventory-receipts/mock/inventory-receipts.mock"
import { inventoryReceiptSourceLabels } from "@/lib/types/inventory-receipt.type"
import { DateTime } from "luxon"

type InventoryReceiptPrintDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptId: string
}

export function InventoryReceiptPrintDialog({
  open,
  onOpenChange,
  receiptId,
}: InventoryReceiptPrintDialogProps) {
  const detail = getMockInventoryReceipt(receiptId)
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
            Bản in - Phiếu nhập kho ({detail.code})
          </DialogTitle>
        </DialogHeader>

        {/* Printable Area */}
        <div
          ref={printRef}
          className="my-2 space-y-4 rounded-md border border-border bg-card p-6 text-sm text-card-foreground shadow-inner"
        >
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-primary">
                CƠ KHÍ TIẾN HUY
              </h2>
              <p className="text-xs text-muted-foreground">
                Hệ thống Quản trị Sản xuất ERP
              </p>
            </div>
            <div className="text-right font-mono">
              <p className="text-base font-bold">{detail.code}</p>
              <p className="text-xs text-muted-foreground">
                {DateTime.fromISO(detail.receiptDate).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
          </div>

          <div className="text-center py-2">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              PHIẾU NHẬP KHO
            </h1>
            <p className="text-xs text-muted-foreground italic">
              Nguồn: {inventoryReceiptSourceLabels[detail.source]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <p>
              <strong className="font-semibold">Kho nhận:</strong>{" "}
              {detail.warehouseName}
            </p>
            <p>
              <strong className="font-semibold">PO / Lý do:</strong>{" "}
              {detail.poOrReason}
            </p>
            <p>
              <strong className="font-semibold">Người tạo:</strong>{" "}
              {detail.createdByName}
            </p>
            <p>
              <strong className="font-semibold">Người giao:</strong>{" "}
              {detail.delivererName ?? "—"}
            </p>
            {detail.note && (
              <p className="col-span-2">
                <strong className="font-semibold">Ghi chú:</strong> {detail.note}
              </p>
            )}
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-border text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-center">STT</th>
                <th className="border border-border p-2 text-left">Mã VT</th>
                <th className="border border-border p-2 text-left">Tên VT</th>
                <th className="border border-border p-2 text-center">ĐVT</th>
                <th className="border border-border p-2 text-right">SL Đạt</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border border-border p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-border p-2 font-mono">
                    {item.materialCode}
                  </td>
                  <td className="border border-border p-2">
                    {item.materialName}
                  </td>
                  <td className="border border-border p-2 text-center">
                    {item.unit}
                  </td>
                  <td className="border border-border p-2 text-right font-semibold">
                    {item.passedQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs pt-6">
            <div>
              <p className="font-semibold">Người lập phiếu</p>
              <p className="mt-12 text-muted-foreground">{detail.createdByName}</p>
            </div>
            <div>
              <p className="font-semibold">Người giao hàng</p>
              <p className="mt-12 text-muted-foreground">
                {detail.delivererName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Thủ kho</p>
              <p className="mt-12 text-muted-foreground">(Ký & ghi rõ họ tên)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 size-4" />
            In phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
