import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { InventoryReceiptStatusBadge } from "@/features/inventory-receipts/components/InventoryReceiptBadges"
import { InventoryReceiptSourceCell } from "@/features/inventory-receipts/components/InventoryReceiptsTableCells"
import { InventoryReceiptDetailActions } from "@/features/inventory-receipts/components/detail/InventoryReceiptDetailActions"
import {
  inventoryReceiptAssetTypeLabels,
  inventoryReceiptTypeLabels,
} from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailHeaderProps = {
  detail: InventoryReceiptDetail
}

export function InventoryReceiptDetailHeader({
  detail,
}: InventoryReceiptDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Back + Code + Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách phiếu nhập kho"
            asChild
          >
            <Link
              to="/manage/inventory-receipts"
              search={{ page: 1, limit: 10 }}
            >
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <InventoryReceiptStatusBadge status={detail.status} />
        </div>

        {/* 3-column MetaFields Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField
              label="PO / Lý do"
              value={
                <InventoryReceiptSourceCell
                  purchaseOrder={detail.purchaseOrder}
                  supplier={detail.supplier}
                  client={detail.client}
                  purchaseRequest={detail.purchaseRequest}
                  productionOrder={detail.productionOrder}
                />
              }
            />
            <MetaField
              label="Loại phiếu"
              value={inventoryReceiptTypeLabels[detail.receiptType]}
            />
            <MetaField
              label="Loại tài sản"
              value={inventoryReceiptAssetTypeLabels[detail.assetType]}
            />
            <MetaField label="Kho nhận" value={detail.warehouse.name} />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ngày nhập"
              value={DateTime.fromISO(detail.receiptDate, {
                zone: "utc",
              }).toFormat("dd/MM/yyyy")}
            />
            <MetaField
              label="Người tạo"
              value={detail.creatorBy?.fullName ?? "—"}
            />
            <MetaField
              label="Người xác nhận"
              value={detail.posterBy?.fullName ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ghi chú"
              value={detail.note ?? "Không có ghi chú"}
            />
          </div>
        </div>
      </div>

      <InventoryReceiptDetailActions detail={detail} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
