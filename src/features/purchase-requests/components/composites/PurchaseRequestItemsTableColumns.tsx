import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import {
  PurchaseRequestItemActionsCell,
  PurchaseRequestItemImageCell,
  PurchaseRequestItemNoteCell,
  PurchaseRequestItemQuantityCell,
} from "@/features/purchase-requests/components/primitives/PurchaseRequestItemCells"
import type {
  PurchaseRequestItem,
  PurchaseRequestStatus,
} from "@/lib/types/purchase-request.type"
import { PurchaseRequestStatus as PRStatus } from "@/lib/types/purchase-request.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const purchaseRequestItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseRequestItem
>()

type BuildPurchaseRequestItemColumnsOptions = {
  status: PurchaseRequestStatus
  canUpdate: boolean
}

export function buildPurchaseRequestItemColumns({
  status,
  canUpdate,
}: BuildPurchaseRequestItemColumnsOptions) {
  const isDraft = status === PRStatus.DRAFT
  const editable = canUpdate && isDraft
  return purchaseRequestItemColumnHelper.columns([
    purchaseRequestItemColumnHelper.display({
      id: "index",
      header: "STT",
      cell: ({ row }) => row.index + 1,
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    }),
    purchaseRequestItemColumnHelper.display({
      id: "image",
      header: "Ảnh",
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <PurchaseRequestItemImageCell
          image={row.original.item.image}
          name={row.original.item.name}
        />
      ),
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
      header: isDraft ? "Thao tác" : "Mua hàng",
      meta: {
        headerClassName: isDraft ? "w-24 text-center" : "w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row, table }) => (
        <PurchaseRequestItemActionsCell
          purchaseRequestItemId={row.original.id}
          itemName={row.original.item.name}
          itemCode={row.original.item.code}
          requiresPurchase={
            row.original.requiresPurchase ?? !row.original.cancelledAt
          }
          status={status}
          canUpdate={canUpdate}
          isLastItem={table.getRowModel().rows.length <= 1}
        />
      ),
    }),
  ])
}
