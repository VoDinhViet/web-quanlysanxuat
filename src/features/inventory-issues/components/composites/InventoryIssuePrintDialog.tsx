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
import { InventoryIssueSourceCell } from "@/features/inventory-issues/components/primitives/InventoryIssueTableCells"
import { inventoryIssueTypeLabels } from "@/lib/types/inventory-issue.type"
import type { InventoryIssue } from "@/lib/types/inventory-issue.type"

type InventoryIssuePrintDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Nhận thẳng qua prop, không tự fetch — trang danh sách đã có sẵn dữ liệu này (bao gồm
  // items) khi mở dialog in, cùng idiom với InventoryReceiptPrintDialog.
  inventoryIssue: InventoryIssue
}

export function InventoryIssuePrintDialog({
  open,
  onOpenChange,
  inventoryIssue,
}: InventoryIssuePrintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            Bản in - Phiếu xuất kho ({inventoryIssue.code})
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
              <p className="text-base font-bold">{inventoryIssue.code}</p>
              <p className="text-xs text-muted-foreground">
                {DateTime.fromISO(inventoryIssue.issueDate, {
                  zone: "utc",
                }).toFormat("dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <div className="py-2 text-center">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              PHIẾU XUẤT KHO
            </h1>
            <p className="text-xs text-muted-foreground italic">
              Loại phiếu: {inventoryIssueTypeLabels[inventoryIssue.issueType]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <p>
              <strong className="font-semibold">Kho xuất:</strong>{" "}
              {inventoryIssue.warehouse.name}
            </p>
            <p className="flex items-center gap-1">
              <strong className="font-semibold">Đối tượng:</strong>{" "}
              <InventoryIssueSourceCell
                productionOrder={inventoryIssue.productionOrder}
                productionJob={inventoryIssue.productionJob}
                department={inventoryIssue.department}
              />
            </p>
            <p>
              <strong className="font-semibold">Người tạo:</strong>{" "}
              {inventoryIssue.creatorBy?.fullName ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">Người xuất:</strong>{" "}
              {inventoryIssue.posterBy?.fullName ?? "—"}
            </p>
            {inventoryIssue.note && (
              <p className="col-span-2">
                <strong className="font-semibold">Ghi chú:</strong>{" "}
                {inventoryIssue.note}
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
                <th className="border border-border p-2 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {inventoryIssue.items.map((item, idx) => (
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
                  <td className="border border-border p-2">
                    {item.note ?? "—"}
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
                {inventoryIssue.creatorBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Thủ kho</p>
              <p className="mt-12 text-muted-foreground">
                {inventoryIssue.posterBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Người nhận</p>
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
