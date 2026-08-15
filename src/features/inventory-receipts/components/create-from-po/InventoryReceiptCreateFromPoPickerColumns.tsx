import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"

import { RadioGroupItem } from "@/components/ui/radio-group"
import { PurchaseOrderProgressBadge } from "@/features/purchase-orders/components/PurchaseOrderBadges"
import { vndFormatter } from "@/lib/currency"
import type { PurchaseOrder } from "@/lib/types/purchase-order.type"

const purchaseOrderPickerColumnHelper = createColumnHelper<PurchaseOrder>()

// Own useReactTable columns for bước ① — chọn đúng 1 PO (radio, không phải checkbox nhiều dòng
// như CreateQuotationItemsPickerColumns.tsx), rút gọn từ PurchaseOrdersTableColumns.tsx (bỏ RFQ
// nguồn/PR nguồn/người phụ trách/thao tác — không cần thiết ở bước chọn PO của wizard này).
export function buildInventoryReceiptFromPoPickerColumns() {
  return [
    purchaseOrderPickerColumnHelper.display({
      id: "select",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <RadioGroupItem
          value={row.original.id}
          aria-label={`Chọn PO ${row.original.code}`}
        />
      ),
    }),
    purchaseOrderPickerColumnHelper.accessor("code", {
      header: "Mã PO",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-primary">
          {getValue()}
        </span>
      ),
    }),
    purchaseOrderPickerColumnHelper.accessor((row) => row.supplier.name, {
      id: "supplier",
      header: "Nhà cung cấp",
      meta: { headerClassName: "min-w-40" },
    }),
    purchaseOrderPickerColumnHelper.accessor("orderDate", {
      header: "Ngày đặt",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) =>
        DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
    }),
    purchaseOrderPickerColumnHelper.accessor("expectedDate", {
      header: "Ngày giao dự kiến",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return value ? DateTime.fromISO(value).toFormat("dd/MM/yyyy") : "—"
      },
    }),
    purchaseOrderPickerColumnHelper.accessor("totalAmount", {
      header: "Giá trị (VND)",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right font-semibold text-foreground tabular-nums",
      },
      cell: ({ getValue }) => vndFormatter.format(getValue()),
    }),
    purchaseOrderPickerColumnHelper.accessor("progress", {
      header: "Trạng thái",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => (
        <PurchaseOrderProgressBadge progress={getValue()} />
      ),
    }),
  ]
}
