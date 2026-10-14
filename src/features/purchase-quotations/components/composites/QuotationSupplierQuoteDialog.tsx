import { DateTime } from "luxon"
import { IconCheck, IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { QuotationSupplierAttachment } from "@/features/purchase-quotations/components/composites/QuotationSupplierAttachment"
import { cn } from "@/lib/utils"
import type {
  PickedQuotationItemValue,
  QuotationItemSupplierValue,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type { PurchaseQuotationLastPurchase } from "@/lib/types/purchase-quotation.type"

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

type QuotationSupplierQuoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: QuotationItemSupplierValue | null
  item: PickedQuotationItemValue | null
  lastPurchase?: PurchaseQuotationLastPurchase
  disabled?: boolean
  onChange: (patch: Partial<QuotationItemSupplierValue>) => void
  onRemove?: () => void
}

export function QuotationSupplierQuoteDialog({
  open,
  onOpenChange,
  supplier,
  item,
  lastPurchase,
  disabled = false,
  onChange,
  onRemove,
}: QuotationSupplierQuoteDialogProps) {
  if (!supplier || !item) {
    return null
  }

  // SL cần mua gốc tính từ tổng phân bổ các dòng ĐXMH
  const baseQuantity = item.allocations.reduce(
    (sum, a) => sum + (a.quantity ?? a.requestedQuantity),
    0
  )
  const quantity = supplier.quotationQuantity ?? baseQuantity
  const hasPrice = supplier.unitPrice != null
  const total = hasPrice ? supplier.unitPrice! * quantity : null
  const isIncompleteSpec =
    Boolean(supplier.quotationUnit?.trim()) !==
    (supplier.quotationQuantity != null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-5">
        {/* Header: Đệm pr-8 để không va chạm nút Close X */}
        <DialogHeader className="gap-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-base font-semibold text-foreground">
              Báo giá NCC — {supplier.supplierLabel}
            </DialogTitle>
            <Badge
              variant={hasPrice ? "success" : "warning"}
              appearance="soft"
              className="gap-1 text-xs"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hasPrice ? "bg-success" : "bg-warning"
                )}
              />
              {hasPrice ? "Đã có giá" : "Chưa có giá"}
            </Badge>
          </div>

          <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 leading-relaxed">
            <span>Vật tư:</span>
            <span className="font-mono font-medium text-primary">
              {item.itemCode}
            </span>
            <span className="text-foreground font-medium">{item.itemName}</span>
            <span>· Cần mua:</span>
            <strong className="text-foreground">
              {baseQuantity.toLocaleString("vi-VN")} {item.unit}
            </strong>
            {lastPurchase && (
              <>
                <span>· Giá gần nhất:</span>
                <strong className="text-foreground">
                  {priceFormatter.format(lastPurchase.unitPrice)}
                </strong>
                {DateTime.fromISO(lastPurchase.orderDate).isValid &&
                  ` (${DateTime.fromISO(lastPurchase.orderDate).toFormat("dd/MM/yyyy")})`}
                {lastPurchase.supplier.id !== supplier.supplierId &&
                  ` · ${lastPurchase.supplier.name}`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Form Controls: Bố trí 2 cột cân đối, phẳng, không bọc card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Đơn giá báo */}
          <div className="space-y-1.5">
            <Label htmlFor="supplier-unit-price" className="text-xs font-medium">
              Đơn giá báo (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <NumericCellInput
              value={supplier.unitPrice}
              placeholder="Nhập đơn giá..."
              min={0}
              disabled={disabled}
              className={cn(
                "h-9 w-full text-right font-medium tabular-nums",
                !hasPrice && "border-warning/60 placeholder:text-warning/70"
              )}
              onValueChange={(unitPrice) => onChange({ unitPrice })}
            />
          </div>

          {/* 2. Thành tiền (tính tự động) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Thành tiền tạm tính
            </Label>
            <div className="flex h-9 items-center justify-between rounded-md bg-muted/40 px-3 text-xs">
              <span className="text-muted-foreground truncate">
                {total != null
                  ? `= ${priceFormatter.format(supplier.unitPrice!)} × ${quantity.toLocaleString("vi-VN")} ${supplier.quotationUnit || item.unit}`
                  : "Chưa có giá"}
              </span>
              <span className="font-semibold text-primary tabular-nums text-sm shrink-0">
                {total != null ? priceFormatter.format(total) : "0 ₫"}
              </span>
            </div>
          </div>

          {/* 3. Lead time */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Thời gian giao hàng (Lead time)
            </Label>
            <div className="relative">
              <NumericCellInput
                value={supplier.leadTimeDays}
                placeholder="Số ngày giao..."
                min={0}
                disabled={disabled}
                className="h-9 w-full pr-12 text-right tabular-nums"
                onValueChange={(leadTimeDays) => onChange({ leadTimeDays })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ngày
              </span>
            </div>
          </div>

          {/* 4. Quy cách & SL báo giá riêng (nếu khác ĐVT gốc) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Quy cách / ĐVT báo giá riêng
              </Label>
              <span className="text-[10px] text-muted-foreground">
                (Nếu khác ĐVT gốc)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumericCellInput
                value={supplier.quotationQuantity}
                placeholder={`SL (${baseQuantity})`}
                min={0}
                disabled={disabled}
                className={cn(
                  "h-9 text-right tabular-nums",
                  isIncompleteSpec &&
                    !supplier.quotationQuantity &&
                    "border-warning/60"
                )}
                onValueChange={(quotationQuantity) => {
                  onChange({
                    quotationQuantity: quotationQuantity ?? undefined,
                    ...(!supplier.quotationUnit &&
                    quotationQuantity != null &&
                    item.unit
                      ? { quotationUnit: item.unit }
                      : {}),
                  })
                }}
              />
              <TableTextCellInput
                value={supplier.quotationUnit ?? ""}
                placeholder={item.unit || "ĐVT"}
                disabled={disabled}
                className={cn(
                  "h-9 text-center",
                  isIncompleteSpec &&
                    !supplier.quotationUnit?.trim() &&
                    "border-warning/60"
                )}
                onValueChange={(val) => {
                  const quotationUnit = val.trim() || undefined
                  onChange({ quotationUnit })
                }}
              />
            </div>
          </div>

          {/* 5. Ghi chú của NCC */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Ghi chú báo giá của NCC
            </Label>
            <Textarea
              value={supplier.note ?? ""}
              placeholder="Điều khoản thanh toán, bảo hành, chính sách giao hàng..."
              disabled={disabled}
              className="min-h-24 text-xs resize-none"
              onChange={(e) => onChange({ note: e.target.value })}
            />
          </div>

          {/* 6. Tệp đính kèm trực tiếp (Không dùng dialog phụ) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Tệp báo giá đính kèm
              </Label>
              {supplier.files && supplier.files.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {supplier.files.length} tệp
                </span>
              )}
            </div>
            <QuotationSupplierAttachment
              value={supplier.files}
              disabled={disabled}
              onChange={(files) => onChange({ files })}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 sm:justify-between border-t border-border/50 pt-3">
          <div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onRemove()
                  onOpenChange(false)
                }}
              >
                <IconTrash className="size-3.5" />
                Xóa NCC này
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={() => onOpenChange(false)}
            >
              <IconCheck className="size-4" />
              Hoàn tất
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
