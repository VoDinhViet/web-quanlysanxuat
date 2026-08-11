import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { TrashBinTrash } from "@solar-icons/react"

import { DatePicker } from "@/components/shared/DatePicker"
import { IconButton } from "@/components/shared/IconButton"
import { NumericCellInput } from "@/features/purchase-quotations/components/create/NumericCellInput"
import { TableTextCellInput } from "@/features/purchase-quotations/components/create/TableTextCellInput"
import type {
  PickedQuotationItemValue,
  QuotationItemSupplierValue,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationQuoteColumnHelper =
  createColumnHelper<QuotationItemSupplierValue>()

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
      meta: { headerClassName: "w-40 text-[10px]" },
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
        <DatePicker
          id={`quotation-quote-last-purchase-date-${itemIndex}-${row.index}`}
          value={row.original.lastPurchaseDate}
          onChange={(value) =>
            updateQuote(row.index, { lastPurchaseDate: value })
          }
        />
      ),
    }),
    quotationQuoteColumnHelper.display({
      id: "unitPrice",
      header: "Giá báo (VNĐ)",
      meta: { headerClassName: "w-44 text-[10px]" },
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
        <IconButton
          label="Xóa NCC"
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
        </IconButton>
      ),
    }),
  ]
}
