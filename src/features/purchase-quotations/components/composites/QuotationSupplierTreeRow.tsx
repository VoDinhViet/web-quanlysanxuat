import { DateTime } from "luxon"
import { TrashBinTrash } from "@solar-icons/react"
import { IconEdit, IconFileDescription, IconPaperclip } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { QuotationTreeGuide } from "@/features/purchase-quotations/components/composites/QuotationTreeGuide"
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

type QuotationSupplierTreeRowProps = {
  item: PickedQuotationItemValue
  supplier: QuotationItemSupplierValue
  lastPurchase?: PurchaseQuotationLastPurchase
  disabled?: boolean
  onChange: (patch: Partial<QuotationItemSupplierValue>) => void
  onRemove: () => void
  onOpenDetail: () => void
}

export function QuotationSupplierTreeRow({
  item,
  supplier,
  lastPurchase,
  disabled = false,
  onChange,
  onRemove,
  onOpenDetail,
}: QuotationSupplierTreeRowProps) {
  const itemQuantity = item.allocations.reduce(
    (sum, a) => sum + (a.quantity ?? a.requestedQuantity),
    0
  )
  const effectiveQuantity = supplier.quotationQuantity ?? itemQuantity
  const effectiveTotal =
    supplier.unitPrice !== undefined && supplier.unitPrice !== null
      ? supplier.unitPrice * effectiveQuantity
      : undefined

  const hasCustomSpec =
    Boolean(supplier.quotationUnit?.trim()) ||
    (supplier.quotationQuantity !== undefined &&
      supplier.quotationQuantity !== null)

  const fileCount = supplier.files?.length ?? 0
  const hasNote = Boolean(supplier.note?.trim())

  const lastPurchaseDate =
    lastPurchase && DateTime.fromISO(lastPurchase.orderDate)
  const isOtherSupplier =
    lastPurchase !== undefined &&
    lastPurchase.supplier.id !== supplier.supplierId

  return (
    <TableRow className="h-14 border-b-0 bg-card/60 transition-colors hover:bg-muted/15">
      <QuotationTreeGuide />
      {/* Cột 1 & 2: Mã VT / NCC + Tên VT */}
      <TableCell colSpan={2}>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {supplier.supplierLabel || "—"}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {lastPurchase ? (
              <>
                {isOtherSupplier
                  ? "Chưa mua của NCC này · gần nhất "
                  : "Mua gần nhất "}
                <span className="font-medium text-foreground">
                  {priceFormatter.format(lastPurchase.unitPrice)}
                </span>
                {lastPurchaseDate?.isValid &&
                  ` · ${lastPurchaseDate.toFormat("dd/MM/yyyy")}`}
                {isOtherSupplier && ` · ${lastPurchase.supplier.name}`}
              </>
            ) : (
              "Chưa từng mua"
            )}
          </p>
        </div>
      </TableCell>

      {/* Cột 4: Cần mua gốc (không áp dụng cho dòng NCC) */}
      <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
        —
      </TableCell>

      {/* Cột 5: SL & ĐV báo giá riêng */}
      <TableCell className="text-center text-xs">
        {hasCustomSpec ? (
          <span className="font-medium text-foreground tabular-nums">
            {supplier.quotationQuantity?.toLocaleString("vi-VN") ?? "—"}{" "}
            {supplier.quotationUnit || item.unit}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Cột 6: Đơn giá (VNĐ) - Cho phép nhập nhanh hoặc mở Dialog */}
      <TableCell>
        <NumericCellInput
          value={supplier.unitPrice}
          placeholder="Nhập giá"
          min={0}
          disabled={disabled}
          className={cn(
            "text-right tabular-nums",
            supplier.unitPrice === undefined &&
              "border-warning/60 placeholder:text-warning/70"
          )}
          onValueChange={(value) => onChange({ unitPrice: value })}
        />
      </TableCell>

      {/* Cột 7: Thành tiền (VNĐ) */}
      <TableCell
        className="text-right font-semibold tabular-nums text-foreground"
        title={
          effectiveTotal !== undefined
            ? `Thành tiền = ${supplier.unitPrice?.toLocaleString("vi-VN")} × ${effectiveQuantity.toLocaleString("vi-VN")} ${supplier.quotationUnit || item.unit}`
            : undefined
        }
      >
        {effectiveTotal !== undefined
          ? priceFormatter.format(effectiveTotal)
          : "—"}
      </TableCell>

      {/* Cột 8: Leadtime (ngày) */}
      <TableCell className="text-center text-xs tabular-nums text-foreground">
        {supplier.leadTimeDays !== undefined && supplier.leadTimeDays !== null ? (
          <span>{supplier.leadTimeDays} ngày</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Cột 9: Ghi chú & Tệp đính kèm tóm tắt */}
      <TableCell>
        <div className="flex items-center gap-2 text-xs">
          {fileCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              <IconPaperclip className="size-3" />
              {fileCount} tệp
            </span>
          )}
          {hasNote && (
            <span
              className="inline-flex max-w-[120px] items-center gap-1 truncate text-muted-foreground"
              title={supplier.note}
            >
              <IconFileDescription className="size-3 shrink-0" />
              <span className="truncate">{supplier.note}</span>
            </span>
          )}
          {fileCount === 0 && !hasNote && (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>

      {/* Cột 10: Thao tác (Chi tiết Dialog + Xóa NCC) */}
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Chi tiết báo giá ${supplier.supplierLabel}`}
            title="Chi tiết báo giá NCC"
            className="size-7 text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={onOpenDetail}
          >
            <IconEdit className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Xóa NCC ${supplier.supplierLabel}`}
            title="Xóa NCC"
            className="size-7 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            disabled={disabled}
            onClick={onRemove}
          >
            <TrashBinTrash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
