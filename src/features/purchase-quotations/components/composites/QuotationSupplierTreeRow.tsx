import { DateTime } from "luxon"
import { TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { QuotationSupplierAttachmentCell } from "@/features/purchase-quotations/components/primitives/QuotationSupplierAttachmentCell"
import { QuotationTreeGuide } from "@/features/purchase-quotations/components/composites/QuotationTreeGuide"
import { cn } from "@/lib/utils"
import type { QuotationItemSupplierValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type { PurchaseQuotationLastPurchase } from "@/lib/types/purchase-quotation.type"

// "Tên NCC (MÃ)" label → name + code chip; a label without a trailing code stays as the name.
function splitSupplierLabel(label: string) {
  const match = /^(.*?)\s*\(([^()]+)\)$/.exec(label)
  return match ? { name: match[1], code: match[2] } : { name: label, code: "" }
}

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

type QuotationSupplierTreeRowProps = {
  supplier: QuotationItemSupplierValue
  // Lần mua gần nhất của vật tư: với chính NCC này nếu có, không thì với NCC khác (hiện tên NCC).
  lastPurchase?: PurchaseQuotationLastPurchase
  disabled?: boolean
  onChange: (patch: Partial<QuotationItemSupplierValue>) => void
  onRemove: () => void
}

// One NCC of a vật tư as a child row of the tree table — same 10-column grid as the vật tư row
// (see QuotationItemsListColumns.tsx). The name spans the code/name/ĐVT columns; price, leadtime
// and note edit inline. Empty `unitPrice` is only tinted, not blocked — the schema allows an RFQ
// to be created before the supplier has quoted.
export function QuotationSupplierTreeRow({
  supplier,
  lastPurchase,
  disabled,
  onChange,
  onRemove,
}: QuotationSupplierTreeRowProps) {
  const lastPurchaseDate =
    lastPurchase && DateTime.fromISO(lastPurchase.orderDate)
  const isOtherSupplier =
    lastPurchase !== undefined &&
    lastPurchase.supplier.id !== supplier.supplierId
  const { name, code } = splitSupplierLabel(supplier.supplierLabel)

  return (
    <TableRow className="h-14 border-b-0 bg-card hover:bg-card">
      <QuotationTreeGuide />
      <TableCell colSpan={3}>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="truncate">{name || "—"}</span>
            {code && (
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                {code}
              </span>
            )}
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
      <TableCell colSpan={2} />
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
      <TableCell>
        <NumericCellInput
          value={supplier.leadTimeDays}
          placeholder="—"
          disabled={disabled}
          className="text-right tabular-nums"
          onValueChange={(value) => onChange({ leadTimeDays: value })}
        />
      </TableCell>
      <TableCell>
        <TableTextCellInput
          value={supplier.note}
          placeholder="Ghi chú"
          disabled={disabled}
          onValueChange={(value) => onChange({ note: value })}
        />
      </TableCell>
      <TableCell className="text-center">
        <QuotationSupplierAttachmentCell
          supplierName={supplier.supplierLabel}
          value={supplier.files}
          disabled={disabled}
          onChange={(files) => onChange({ files })}
        />
      </TableCell>
      <TableCell className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Xóa NCC ${supplier.supplierLabel}`}
          title="Xóa NCC"
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled}
          onClick={onRemove}
        >
          <TrashBinTrash className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
