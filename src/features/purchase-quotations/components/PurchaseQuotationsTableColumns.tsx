import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { MissingFieldValue } from "@/components/shared/MissingFieldValue"
import { PurchaseQuotationStatusBadge } from "@/features/purchase-quotations/components/PurchaseQuotationBadges"
import { PurchaseQuotationActionsCell } from "@/features/purchase-quotations/components/PurchaseQuotationsTableCells"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationColumnHelper = createColumnHelper<PurchaseQuotationRow>()

export const purchaseQuotationsColumns = [
  purchaseQuotationColumnHelper.accessor("code", {
    header: "Mã RFQ",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  purchaseQuotationColumnHelper.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "NCC",
    meta: { headerClassName: "min-w-40" },
  }),

  purchaseQuotationColumnHelper.accessor("quotationDate", {
    header: "Ngày lập",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  purchaseQuotationColumnHelper.accessor(
    (row) => row.creator?.fullName ?? "—",
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

  // GET /purchase-quotations (list) doesn't return senderBy/sentAt — only the detail endpoint
  // does (see purchase-quotation.type.ts). Real gap, not a genuinely-empty field.
  purchaseQuotationColumnHelper.display({
    id: "sent",
    header: "Ngày gửi",
    meta: { headerClassName: "min-w-28" },
    cell: () => <MissingFieldValue />,
  }),

  // Same as "sent" above — receiverBy/receivedAt only exist on the detail endpoint.
  purchaseQuotationColumnHelper.display({
    id: "received",
    header: "Ngày nhận báo giá",
    meta: { headerClassName: "min-w-32" },
    cell: () => <MissingFieldValue />,
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
    cell: () => <PurchaseQuotationActionsCell />,
  }),
]
