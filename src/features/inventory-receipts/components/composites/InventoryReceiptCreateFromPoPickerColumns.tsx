import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { vndFormatter } from "@/lib/currency"
import {
  purchaseOrderProgressLabels,
  PurchaseOrderProgress,
} from "@/lib/types/purchase-order.type"
import type { PurchaseOrder } from "@/lib/types/purchase-order.type"
import { cn } from "@/lib/utils"

// Local, temporary copy of PurchaseOrderProgressBadge's palette (purchase-orders/components/
// PurchaseOrderBadges.tsx) — a picker column can't import another feature's components/ (see
// architecture.md's cross-feature import rule). Collapses into the shared StatusBadge kit
// component once inventory-receipts migrates to it.
type ProgressBadgeStyle = { badge: string; dot: string }

const purchaseOrderProgressStyles: Record<
  PurchaseOrderProgress,
  ProgressBadgeStyle
> = {
  [PurchaseOrderProgress.DRAFT]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [PurchaseOrderProgress.ORDERED]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [PurchaseOrderProgress.RECEIVING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [PurchaseOrderProgress.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [PurchaseOrderProgress.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

function PurchaseOrderProgressBadge({
  progress,
}: {
  progress: PurchaseOrderProgress
}) {
  const { badge, dot } = purchaseOrderProgressStyles[progress]

  return (
    <Badge variant="outline" className={cn(badge)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseOrderProgressLabels[progress]}
    </Badge>
  )
}

const purchaseOrderPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseOrder
>()

// Own useReactTable columns for bước ① — chọn đúng 1 PO (radio, không phải checkbox nhiều dòng
// như CreateQuotationItemsPickerColumns.tsx), rút gọn từ PurchaseOrdersTableColumns.tsx (bỏ RFQ
// nguồn/PR nguồn/người phụ trách/thao tác — không cần thiết ở bước chọn PO của wizard này).
export function buildInventoryReceiptFromPoPickerColumns() {
  return purchaseOrderPickerColumnHelper.columns([
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
  ])
}
