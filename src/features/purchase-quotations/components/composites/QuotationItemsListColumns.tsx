import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { AnyFieldApi } from "@tanstack/react-form"
import { AltArrowDown, AltArrowRight, TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { QuotationItemQuantityControl } from "@/features/purchase-quotations/components/composites/QuotationItemQuantityControl"
import { getQuotationItemStatus } from "@/features/purchase-quotations/constants/quotation-item-status"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PickedQuotationItemValue
>()

type BuildQuotationItemsListColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  collapsedIds: ReadonlySet<string>
  onToggleItem: (itemId: string) => void
}

// Columns of the vật tư level of the RFQ tree table in CreateQuotationSuppliersSection. The table
// has 10 columns shared by three row kinds — vật tư (these columns), NCC and "add NCC" rows (see
// QuotationSupplierTreeRow / QuotationAddSupplierInlineRow) — so header widths line up. The vật tư
// row spans the price/leadtime/note columns with its NCC summary, hence `leadTime`/`note` exist
// only as header slots (their cells are skipped by the section).
export function buildQuotationItemsListColumns({
  itemsField,
  disabled,
  collapsedIds,
  onToggleItem,
}: BuildQuotationItemsListColumnsArgs) {
  return quotationItemColumnHelper.columns([
    quotationItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-16" },
      cell: ({ row }) => {
        const isCollapsed = collapsedIds.has(row.original.itemId)
        const Chevron = isCollapsed ? AltArrowRight : AltArrowDown
        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Mở" : "Thu gọn"} NCC của vật tư ${row.original.itemCode}`}
              className="size-6 text-muted-foreground"
              onClick={() => onToggleItem(row.original.itemId)}
            >
              <Chevron className="size-4" />
            </Button>
            <span className="text-muted-foreground tabular-nums">
              {row.index + 1}
            </span>
          </div>
        )
      },
    }),
    quotationItemColumnHelper.accessor("itemCode", {
      header: "Mã vật tư / NCC",
      meta: {
        headerClassName: "w-36",
        cellClassName: "font-mono text-primary",
      },
    }),
    quotationItemColumnHelper.accessor("itemName", {
      header: "Tên vật tư",
      meta: { headerClassName: "min-w-48", cellClassName: "font-medium" },
    }),
    quotationItemColumnHelper.accessor("unit", {
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    quotationItemColumnHelper.display({
      id: "requestedQuantity",
      header: "Cần mua",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => getQuotationItemStatus(row.original).requestedTotal,
    }),
    quotationItemColumnHelper.display({
      id: "quantity",
      header: "SL báo giá",
      meta: { headerClassName: "w-36 text-right", cellClassName: "text-right" },
      cell: ({ row }) => (
        <QuotationItemQuantityControl
          item={row.original}
          itemIndex={row.index}
          itemsField={itemsField}
          disabled={disabled}
        />
      ),
    }),
    quotationItemColumnHelper.display({
      id: "unitPrice",
      header: "Giá báo (VNĐ) *",
      meta: { headerClassName: "w-44 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const { pricedSupplierCount } = getQuotationItemStatus(item)
        const supplierCount = item.suppliers.length
        const isReady =
          supplierCount > 0 && pricedSupplierCount === supplierCount

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              isReady ? "text-success" : "text-warning"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isReady ? "bg-success" : "bg-warning"
              )}
            />
            {supplierCount === 0
              ? "Chưa có NCC"
              : `${supplierCount} NCC · ${pricedSupplierCount}/${supplierCount} đã có giá`}
          </span>
        )
      },
    }),
    quotationItemColumnHelper.display({
      id: "leadTime",
      header: "Leadtime (ngày)",
      meta: { headerClassName: "w-32 text-right" },
    }),
    quotationItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "min-w-44" },
    }),
    quotationItemColumnHelper.display({
      id: "actions",
      header: "",
      meta: { headerClassName: "w-16", cellClassName: "text-center" },
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Bỏ chọn vật tư ${row.original.itemCode}`}
          title="Bỏ chọn vật tư"
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled}
          onClick={() => itemsField.removeValue(row.index)}
        >
          <TrashBinTrash className="size-4" />
        </Button>
      ),
    }),
  ])
}
