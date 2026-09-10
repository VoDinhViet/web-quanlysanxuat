import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { AnyFieldApi } from "@tanstack/react-form"
import { TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type {
  PickedQuotationItemValue,
  QuotationItemSupplierValue,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

const quotationQuoteColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  QuotationItemSupplierValue
>()

type BuildQuotationSuppliersQuoteColumnsArgs = {
  itemsField: AnyFieldApi
  itemIndex: number
  item: PickedQuotationItemValue
  disabled?: boolean
}

// Own useReactTable columns for the inner (per-NCC) table nested under each vật tư row —
// mutating a supplier here always rewrites the WHOLE parent item via `itemsField.replaceValue`,
// same as the outer columns, since `suppliers` lives nested inside `items[itemIndex]` in form
// state.
export function buildQuotationSuppliersQuoteColumns({
  itemsField,
  itemIndex,
  item,
  disabled,
}: BuildQuotationSuppliersQuoteColumnsArgs) {
  const updateQuote = (
    quoteIndex: number,
    patch: Partial<QuotationItemSupplierValue>
  ) =>
    itemsField.replaceValue(itemIndex, {
      ...item,
      suppliers: item.suppliers.map((supplier, index) =>
        index === quoteIndex ? { ...supplier, ...patch } : supplier
      ),
    })

  return quotationQuoteColumnHelper.columns([
    quotationQuoteColumnHelper.accessor("supplierLabel", {
      header: "Nhà cung cấp",
      meta: {
        headerClassName: "pl-10 text-[10px]",
        cellClassName: "truncate pl-10 font-medium",
      },
      cell: ({ getValue }) => getValue() || "—",
    }),
    quotationQuoteColumnHelper.display({
      id: "lastPrice",
      header: "Giá gần nhất",
      meta: {
        headerClassName: "w-36 text-[10px]",
        cellClassName: "tabular-nums text-xs",
      },
      cell: ({ row }) => {
        const lastPrice = row.original.lastPrice
        return typeof lastPrice === "number" ? (
          <span className="font-medium text-foreground">
            {priceFormatter.format(lastPrice)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    }),
    quotationQuoteColumnHelper.display({
      id: "lastPurchaseDate",
      header: "Ngày mua gần nhất",
      meta: {
        headerClassName: "w-32 text-[10px]",
        cellClassName: "tabular-nums text-xs",
      },
      cell: ({ row }) => {
        const date = row.original.lastPurchaseDate
        if (!date) return <span className="text-muted-foreground">—</span>
        const parsed = DateTime.fromISO(date)
        return (
          <span className="font-medium text-foreground">
            {parsed.isValid ? parsed.toFormat("dd/MM/yyyy") : date}
          </span>
        )
      },
    }),
    quotationQuoteColumnHelper.display({
      id: "unitPrice",
      header: "Giá báo (VNĐ) *",
      meta: { headerClassName: "w-44 text-[10px]" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.unitPrice}
          placeholder="Nhập giá báo *"
          min={0}
          disabled={disabled}
          onValueChange={(value) =>
            updateQuote(row.index, { unitPrice: value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "leadTimeDays",
      header: "Leadtime (ngày)",
      meta: { headerClassName: "w-32 text-[10px]" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.leadTimeDays}
          placeholder="Leadtime"
          disabled={disabled}
          onValueChange={(value) =>
            updateQuote(row.index, { leadTimeDays: value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "text-[10px]" },
      cell: ({ row }) => (
        <TableTextCellInput
          value={row.original.note}
          placeholder="Ghi chú"
          disabled={disabled}
          onValueChange={(value) => updateQuote(row.index, { note: value })}
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "actions",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Xóa NCC"
                className="text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                disabled={disabled}
                onClick={() =>
                  itemsField.replaceValue(itemIndex, {
                    ...item,
                    suppliers: item.suppliers.filter(
                      (_, index) => index !== row.index
                    ),
                  })
                }
              >
                <TrashBinTrash className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>Xóa NCC</TooltipContent>
        </Tooltip>
      ),
    }),
  ])
}
