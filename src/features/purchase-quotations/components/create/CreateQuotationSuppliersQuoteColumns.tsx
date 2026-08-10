import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { IconButton } from "@/components/shared/IconButton"
import { NumericCellInput } from "@/features/purchase-quotations/components/create/NumericCellInput"
import type {
  PickedQuotationItemValue,
  QuotationSupplierQuoteValue,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationQuoteColumnHelper =
  createColumnHelper<QuotationSupplierQuoteValue>()

type BuildQuotationSuppliersQuoteColumnsArgs = {
  itemsField: AnyFieldApi
  itemIndex: number
  item: PickedQuotationItemValue
  disabled?: boolean
}

// Own useReactTable columns for the inner (per-NCC) table nested under each vật tư row —
// mutating a quote here always rewrites the WHOLE parent item via `itemsField.replaceValue`,
// same as the outer columns, since `quotes` lives nested inside `items[itemIndex]` in form state.
export function buildQuotationSuppliersQuoteColumns({
  itemsField,
  itemIndex,
  item,
  disabled,
}: BuildQuotationSuppliersQuoteColumnsArgs) {
  const updateQuote = (
    quoteIndex: number,
    patch: Partial<QuotationSupplierQuoteValue>
  ) =>
    itemsField.replaceValue(itemIndex, {
      ...item,
      quotes: item.quotes.map((quote, index) =>
        index === quoteIndex ? { ...quote, ...patch } : quote
      ),
    })

  return [
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
      meta: { headerClassName: "w-32 text-[10px]" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.lastPrice}
          placeholder="Tham khảo"
          disabled={disabled}
          onValueChange={(value) =>
            updateQuote(row.index, { lastPrice: value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "lastPurchaseDate",
      header: "Ngày mua gần nhất",
      meta: { headerClassName: "w-32 text-[10px]" },
      cell: ({ row }) => (
        <Input
          className="h-8 bg-background text-xs"
          placeholder="dd/mm/yyyy"
          value={row.original.lastPurchaseDate}
          disabled={disabled}
          onChange={(event) =>
            updateQuote(row.index, { lastPurchaseDate: event.target.value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "unitPrice",
      header: "Giá báo (VNĐ)",
      meta: { headerClassName: "w-36 text-[10px]" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.unitPrice}
          placeholder="Giá báo"
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
      meta: { headerClassName: "w-28 text-[10px]" },
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
        <Input
          className="h-8 bg-background text-xs"
          placeholder="Ghi chú"
          value={row.original.note}
          disabled={disabled}
          onChange={(event) =>
            updateQuote(row.index, { note: event.target.value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "actions",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <IconButton
          label="Xóa NCC"
          className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
          disabled={disabled}
          onClick={() =>
            itemsField.replaceValue(itemIndex, {
              ...item,
              quotes: item.quotes.filter((_, index) => index !== row.index),
            })
          }
        >
          <Trash2 className="size-3.5" />
        </IconButton>
      ),
    }),
  ]
}
