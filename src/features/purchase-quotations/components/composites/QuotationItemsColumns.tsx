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

type BuildQuotationItemsColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  collapsedIds: ReadonlySet<string>
  onToggleItem: (itemId: string) => void
}

export function buildQuotationItemsColumns({
  itemsField,
  disabled = false,
  collapsedIds,
  onToggleItem,
}: BuildQuotationItemsColumnsArgs) {
  return quotationItemColumnHelper.columns([
    quotationItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-14" },
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
        cellClassName: "font-mono text-primary font-medium text-xs",
      },
    }),
    quotationItemColumnHelper.accessor("itemName", {
      header: "Tên vật tư",
      meta: { headerClassName: "min-w-44", cellClassName: "font-medium" },
    }),
    quotationItemColumnHelper.display({
      id: "quantity",
      header: "Cần mua",
      meta: { headerClassName: "w-36 text-right", cellClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <div className="w-20">
            <QuotationItemQuantityControl
              item={row.original}
              itemIndex={row.index}
              itemsField={itemsField}
              disabled={disabled}
            />
          </div>
          <span
            className="w-8 shrink-0 truncate text-left text-xs font-semibold text-muted-foreground"
            title={row.original.unit}
          >
            {row.original.unit}
          </span>
        </div>
      ),
    }),
    quotationItemColumnHelper.display({
      id: "quotationSpec",
      header: "SL & ĐV báo giá",
      meta: {
        headerClassName: "w-40 text-center",
        cellClassName: "text-center text-muted-foreground text-xs",
      },
      cell: () => "—",
    }),
    quotationItemColumnHelper.display({
      id: "unitPrice",
      header: "Đơn giá (VNĐ)",
      meta: { headerClassName: "w-36 text-right" },
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
      id: "totalAmount",
      header: "Thành tiền (VNĐ)",
      meta: { headerClassName: "w-36 text-right" },
    }),
    quotationItemColumnHelper.display({
      id: "leadTime",
      header: "Leadtime",
      meta: { headerClassName: "w-28 text-center" },
    }),
    quotationItemColumnHelper.display({
      id: "note",
      header: "Ghi chú & Tệp",
      meta: { headerClassName: "min-w-36" },
    }),
    quotationItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: { headerClassName: "w-28 text-center", cellClassName: "text-center" },
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Bỏ chọn vật tư ${row.original.itemCode}`}
          title="Bỏ chọn vật tư"
          className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          disabled={disabled}
          onClick={() => itemsField.removeValue(row.index)}
        >
          <TrashBinTrash className="size-4" />
        </Button>
      ),
    }),
  ])
}
