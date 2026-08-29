import { DateTime } from "luxon"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InventoryReceiptSourceCell } from "@/features/inventory-receipts/components/primitives/InventoryReceiptTableCells"
import { inventoryReceiptTypeLabels } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceipt } from "@/lib/types/inventory-receipt.type"
import { vndFormatter } from "@/lib/currency"

type InventoryReceiptDetailPrintDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Nhận thẳng qua prop thay vì tự fetch — cả trang danh sách (InventoryReceipt) lẫn trang chi
  // tiết (InventoryReceiptDetail, cấu trúc rộng hơn nên gán được vào đây) đều đã có sẵn dữ liệu
  // này trong tay khi mở dialog in.
  detail: InventoryReceipt
}

export function InventoryReceiptDetailPrintDialog({
  open,
  onOpenChange,
  detail,
}: InventoryReceiptDetailPrintDialogProps) {
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
        <div className="my-2 space-y-4 rounded-md border border-border bg-card p-6 text-sm text-card-foreground shadow-inner">
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
                {DateTime.fromISO(detail.receiptDate, { zone: "utc" }).toFormat(
                  "dd/MM/yyyy"
                )}
              </p>
            </div>
          </div>

          <div className="py-2 text-center">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              PHIẾU NHẬP KHO
            </h1>
            <p className="text-xs text-muted-foreground italic">
              Loại phiếu: {inventoryReceiptTypeLabels[detail.receiptType]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <p>
              <strong className="font-semibold">Kho nhận:</strong>{" "}
              {detail.warehouse.name}
            </p>
            <p className="flex items-center gap-1">
              <strong className="font-semibold">PO / Lý do:</strong>{" "}
              <InventoryReceiptSourceCell
                purchaseOrder={detail.purchaseOrder}
                supplier={detail.supplier}
                client={detail.client}
                purchaseRequest={detail.purchaseRequest}
                productionOrder={detail.productionOrder}
              />
            </p>
            <p>
              <strong className="font-semibold">Người tạo:</strong>{" "}
              {detail.creatorBy?.fullName ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">Người xác nhận:</strong>{" "}
              {detail.posterBy?.fullName ?? "—"}
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
                <th className="border border-border p-2 text-left">Mã VT</th>
                <th className="border border-border p-2 text-left">Tên VT</th>
                <th className="border border-border p-2 text-right">
                  Số lượng
                </th>
                <th className="border border-border p-2 text-right">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border border-border p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-border p-2 font-mono">
                    {item.item.code}
                  </td>
                  <td className="border border-border p-2">{item.item.name}</td>
                  <td className="border border-border p-2 text-right font-semibold">
                    {item.quantity}
                  </td>
                  <td className="border border-border p-2 text-right">
                    {item.unitPrice !== null
                      ? vndFormatter.format(item.unitPrice)
                      : "—"}
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
                {detail.creatorBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Người xác nhận nhập kho</p>
              <p className="mt-12 text-muted-foreground">
                {detail.posterBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Thủ kho</p>
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
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 size-4" />
            In phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
