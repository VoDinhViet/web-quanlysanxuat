import { DateTime } from "luxon"
import { TrashBinTrash } from "@solar-icons/react"
import {
  IconEdit,
  IconFileDescription,
  IconPaperclip,
} from "@tabler/icons-react"

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

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type QuotationItemSupplierRowProps = {
  item: PickedQuotationItemValue
  supplier: QuotationItemSupplierValue
  lastPurchase?: PurchaseQuotationLastPurchase
  disabled?: boolean
  onChange: (patch: Partial<QuotationItemSupplierValue>) => void
  onRemove: () => void
  onOpenDetail: () => void
}

export function QuotationItemSupplierRow({
  item,
  supplier,
  lastPurchase,
  disabled = false,
  onChange,
  onRemove,
  onOpenDetail,
}: QuotationItemSupplierRowProps) {
  const itemQuantity = item.allocations.reduce(
    (sum, a) => sum + (a.quantity ?? a.requestedQuantity),
    0
  )
  const effectiveQuantity = supplier.quotationQuantity ?? itemQuantity
  const quotedUnit = supplier.quotationUnit || item.unit
  const { unitPrice } = supplier
  const effectiveTotal =
    unitPrice === undefined ? undefined : unitPrice * effectiveQuantity

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
    <TableRow className="h-14 border-b border-border/50 bg-card/60 transition-colors hover:bg-muted/15">
      <QuotationTreeGuide />
      {/* Cột 1 & 2: Mã VT / NCC + Tên VT */}
      <TableCell colSpan={2}>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
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

      {/* Cột 5: SL & ĐV báo giá — chỉ hiện khi NCC báo khác đơn vị gốc, kèm SL gốc để đối chiếu */}
      <TableCell className="py-2 text-center tabular-nums">
        {hasCustomSpec ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {quantityFormatter.format(effectiveQuantity)} {quotedUnit}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              Gốc: {quantityFormatter.format(itemQuantity)} {item.unit}
            </p>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Cột 6: Đơn giá (VNĐ) - Cho phép nhập nhanh hoặc mở Dialog */}
      <TableCell className="py-2">
        <NumericCellInput
          value={unitPrice}
          placeholder="Nhập giá"
          min={0}
          disabled={disabled}
          className={cn(
            "text-right tabular-nums",
            unitPrice === undefined &&
              "border-warning/60 placeholder:text-warning/70"
          )}
          onValueChange={(value) => onChange({ unitPrice: value })}
        />
        {hasCustomSpec && (
          <p className="mt-0.5 text-right text-xs text-muted-foreground">
            ₫ / {quotedUnit}
          </p>
        )}
      </TableCell>

      {/* Cột 7: Thành tiền (VNĐ) — khi báo khác đơn vị gốc, thêm giá quy đổi về đơn vị gốc */}
      <TableCell className="py-2 text-right text-foreground tabular-nums">
        <p className="font-semibold">
          {effectiveTotal === undefined
            ? "—"
            : priceFormatter.format(effectiveTotal)}
        </p>
        {hasCustomSpec && effectiveTotal !== undefined && itemQuantity > 0 && (
          <p className="text-xs text-muted-foreground">
            ≈ {priceFormatter.format(effectiveTotal / itemQuantity)} /{" "}
            {item.unit} gốc
          </p>
        )}
      </TableCell>

      {/* Cột 8: Leadtime (ngày) */}
      <TableCell className="text-center text-xs text-foreground tabular-nums">
        {supplier.leadTimeDays !== undefined &&
        supplier.leadTimeDays !== null ? (
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
