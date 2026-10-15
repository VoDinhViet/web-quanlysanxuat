import { createColumnHelper } from "@tanstack/react-table"

import { RadioGroupItem } from "@/components/ui/radio-group"
import type { appTableFeatures } from "@/lib/table-features"
import type { Item } from "@/lib/types/item.type"

const itemPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Item
>()

// Single-pick product table for the create-NCR page — radio column + the fields QC needs to
// tell two products apart.
export function buildNcrItemPickerColumns() {
  return itemPickerColumnHelper.columns([
    itemPickerColumnHelper.display({
      id: "select",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <RadioGroupItem
          value={row.original.id}
          aria-label={`Chọn sản phẩm ${row.original.code}`}
        />
      ),
    }),
    itemPickerColumnHelper.accessor("code", {
      header: "Mã sản phẩm",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="font-mono font-medium text-primary">{getValue()}</span>
      ),
    }),
    itemPickerColumnHelper.accessor("name", {
      header: "Tên sản phẩm",
      meta: { headerClassName: "min-w-48" },
    }),
    itemPickerColumnHelper.accessor("revision", {
      header: "Rev",
      meta: {
        headerClassName: "w-16 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    }),
    itemPickerColumnHelper.accessor((item) => item.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: {
        headerClassName: "min-w-36",
        cellClassName: "text-muted-foreground",
      },
    }),
  ])
}
