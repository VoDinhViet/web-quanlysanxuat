import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { PurchaseQuotationStatusBadge } from "@/features/purchase-quotations/components/primitives/PurchaseQuotationBadges"
import { PurchaseQuotationActionsCell } from "@/features/purchase-quotations/components/primitives/PurchaseQuotationTableCells"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseQuotationRow
>()

export const purchaseQuotationsColumns = purchaseQuotationColumnHelper.columns([
  purchaseQuotationColumnHelper.accessor("code", {
    header: "Mã RFQ",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  purchaseQuotationColumnHelper.accessor("createdAt", {
    header: "Ngày lập",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  purchaseQuotationColumnHelper.accessor(
    (row) => row.creatorBy?.fullName ?? "—",
    {
      id: "creator",
      header: "Người tạo",
      meta: { headerClassName: "min-w-32" },
    }
  ),

  purchaseQuotationColumnHelper.accessor("itemCount", {
    header: "Số vật tư",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center",
    },
  }),

  purchaseQuotationColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <PurchaseQuotationStatusBadge status={getValue()} />
    ),
  }),

  purchaseQuotationColumnHelper.accessor("sentAt", {
    header: "Ngày gửi",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const sentAt = getValue()
      return sentAt ? DateTime.fromISO(sentAt).toFormat("dd/MM/yyyy") : "—"
    },
  }),

  purchaseQuotationColumnHelper.accessor("approvedAt", {
    header: "Ngày duyệt",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const approvedAt = getValue()
      return approvedAt
        ? DateTime.fromISO(approvedAt).toFormat("dd/MM/yyyy")
        : "—"
    },
  }),

  purchaseQuotationColumnHelper.accessor((row) => row.note ?? "—", {
    id: "note",
    header: "Ghi chú",
    meta: { headerClassName: "min-w-40 max-w-56" },
    cell: ({ getValue }) => (
      <span className="line-clamp-2 max-w-56 text-xs text-muted-foreground">
        {getValue()}
      </span>
    ),
  }),

  purchaseQuotationColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <PurchaseQuotationActionsCell purchaseQuotationId={row.original.id} />
    ),
  }),
])
