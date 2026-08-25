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
import { iqcDispositionLabels, iqcResultLabels } from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

type IqcPrintDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  iqc: IqcDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Modeled on InventoryReceiptPrintDialog.tsx — same header/signature shell, table body swapped
// for the AQL/kết quả chỉ tiêu of one IQC record instead of a list of receipt lines.
export function IqcPrintDialog({
  open,
  onOpenChange,
  iqc,
}: IqcPrintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            Bản in - Phiếu IQC ({iqc.code})
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
              <p className="text-base font-bold">{iqc.code}</p>
              <p className="text-xs text-muted-foreground">
                {DateTime.fromISO(iqc.inspectionDate).toFormat("dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <div className="py-2 text-center">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              Phiếu kiểm tra chất lượng đầu vào (IQC)
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <p>
              <strong className="font-semibold">
                {iqc.client ? "Khách hàng:" : "Nhà cung cấp:"}
              </strong>{" "}
              {iqc.supplier?.name ?? iqc.client?.name ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">Vật tư:</strong> {iqc.item.code}{" "}
              - {iqc.item.name}
            </p>
            <p>
              <strong className="font-semibold">Số lượng:</strong>{" "}
              {quantityFormatter.format(iqc.quantity)} {iqc.item.unit.name}
            </p>
            <p>
              <strong className="font-semibold">Mã NK:</strong>{" "}
              {iqc.inventoryReceipt?.code ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">PO:</strong>{" "}
              {iqc.purchaseOrder?.code ?? "—"}
            </p>
            <p>
              <strong className="font-semibold">Người tạo:</strong>{" "}
              {iqc.creatorBy?.fullName ?? "—"}
            </p>
          </div>

          <table className="w-full border-collapse border border-border text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left">Chỉ tiêu</th>
                <th className="border border-border p-2 text-left">Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">Inspection Level</td>
                <td className="border border-border p-2">
                  {iqc.inspectionLevel ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-border p-2">Mức AQL</td>
                <td className="border border-border p-2">
                  {iqc.aqlLevel !== null ? `${iqc.aqlLevel.toFixed(2)}%` : "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-border p-2">Cỡ mẫu</td>
                <td className="border border-border p-2">
                  {iqc.sampleSize ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-border p-2">Số lượng lỗi</td>
                <td className="border border-border p-2">
                  {iqc.defectQty ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-border p-2">Kết quả</td>
                <td className="border border-border p-2 font-semibold">
                  {iqc.result ? iqcResultLabels[iqc.result] : "—"}
                </td>
              </tr>
              {iqc.disposition && (
                <tr>
                  <td className="border border-border p-2">Phương án xử lý</td>
                  <td className="border border-border p-2">
                    {iqcDispositionLabels[iqc.disposition]}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {iqc.resultNote && (
            <p className="text-xs">
              <strong className="font-semibold">Ghi chú kết quả:</strong>{" "}
              {iqc.resultNote}
            </p>
          )}
          {iqc.dispositionNote && (
            <p className="text-xs">
              <strong className="font-semibold">Ghi chú quyết định:</strong>{" "}
              {iqc.dispositionNote}
            </p>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs">
            <div>
              <p className="font-semibold">Người kiểm tra (QC)</p>
              <p className="mt-12 text-muted-foreground">
                {iqc.confirmerBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Người xử lý</p>
              <p className="mt-12 text-muted-foreground">
                {iqc.resolverBy?.fullName ?? "(Ký & ghi rõ họ tên)"}
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
