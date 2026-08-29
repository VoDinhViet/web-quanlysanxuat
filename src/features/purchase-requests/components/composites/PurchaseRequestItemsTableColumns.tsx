import { createColumnHelper } from "@tanstack/react-table"

import {
  PurchaseRequestItemActionsCell,
  PurchaseRequestItemNoteCell,
  PurchaseRequestItemQuantityCell,
} from "@/features/purchase-requests/components/primitives/PurchaseRequestItemCells"
import type { PurchaseRequestItem } from "@/lib/types/purchase-request.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const purchaseRequestItemColumnHelper =
  createColumnHelper<PurchaseRequestItem>()

// A factory (paired with `useMemo` at the call site) rather than a module-scope constant — the
// last 3 columns gate on `editable`, which changes per-page (permission + phiếu status), so they
// can't be built once at module load like every read-only column list in this codebase. Each of
// those 3 cells now owns its own mutation (reads `purchaseRequestId` via `useParams`), so no
// per-row callbacks are threaded through here anymore.
export function buildPurchaseRequestItemColumns(editable: boolean) {
  return [
    purchaseRequestItemColumnHelper.display({
      id: "index",
      header: "STT",
      cell: ({ row }) => row.index + 1,
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    }),
    purchaseRequestItemColumnHelper.accessor((row) => row.item.code, {
      id: "code",
      header: "Mã vật tư",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-foreground">
          {getValue()}
        </span>
      ),
    }),
    purchaseRequestItemColumnHelper.accessor((row) => row.item.name, {
      id: "name",
      header: "Tên vật tư",
      meta: { headerClassName: "min-w-44" },
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue()}</span>
      ),
    }),
    purchaseRequestItemColumnHelper.accessor((row) => row.item.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-20 text-muted-foreground" },
    }),
    purchaseRequestItemColumnHelper.accessor("bomDemand", {
      header: "Nhu cầu BOM",
      meta: {
        headerClassName: "w-28 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    purchaseRequestItemColumnHelper.accessor("onHand", {
      header: "Tồn thực tế",
      meta: {
        headerClassName: "w-28 text-center",
        cellClassName: "text-center tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    purchaseRequestItemColumnHelper.accessor("available", {
      header: "Tồn khả dụng",
      meta: {
        headerClassName: "w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => {
        const value = getValue()

        return (
          <span
            className={
              value < 0
                ? "font-semibold text-destructive tabular-nums"
                : "font-semibold text-success tabular-nums"
            }
          >
            {quantityFormatter.format(value)}
          </span>
        )
      },
    }),
    purchaseRequestItemColumnHelper.accessor("fromStock", {
      header: "Đã báo tồn cho PO này",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    purchaseRequestItemColumnHelper.display({
      id: "quantity",
      header: "SL đề xuất",
      meta: { headerClassName: "w-28 text-center" },
      cell: ({ row }) => (
        <PurchaseRequestItemQuantityCell
          purchaseRequestItemId={row.original.id}
          itemName={row.original.item.name}
          quantity={row.original.quantity}
          editable={editable}
        />
      ),
    }),
    purchaseRequestItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "min-w-32" },
      cell: ({ row }) => (
        <PurchaseRequestItemNoteCell
          purchaseRequestItemId={row.original.id}
          itemName={row.original.item.name}
          note={row.original.note}
          editable={editable}
        />
      ),
    }),
    purchaseRequestItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-24 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row, table }) => (
        <PurchaseRequestItemActionsCell
          purchaseRequestItemId={row.original.id}
          itemName={row.original.item.name}
          itemCode={row.original.item.code}
          editable={editable}
          isLastItem={table.getRowModel().rows.length <= 1}
        />
      ),
    }),
  ]
}
