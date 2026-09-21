import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import {
  InventoryReceiptItemTypeBadge,
  InventoryReceiptStatusBadge,
} from "@/features/inventory-receipts/components/primitives/InventoryReceiptBadges"
import { InventoryReceiptSourceCell } from "@/features/inventory-receipts/components/primitives/InventoryReceiptTableCells"
import { InventoryReceiptDetailActions } from "@/features/inventory-receipts/components/layouts/InventoryReceiptDetailActions"
import {
  inventoryReceiptAssetTypeLabels,
  inventoryReceiptTypeLabels,
} from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptDetailHeaderProps = {
  inventoryReceipt: InventoryReceiptDetail
}

export function InventoryReceiptDetailHeader({
  inventoryReceipt,
}: InventoryReceiptDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Back + Code + Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/inventory-receipts"
            search={{
              page: 1,
              limit: 10,
            }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách phiếu nhập kho"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {inventoryReceipt.code}
          </span>
          <InventoryReceiptStatusBadge status={inventoryReceipt.status} />
        </div>

        {/* 3-column MetaFields Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField
              label="PO / Lý do"
              value={
                <InventoryReceiptSourceCell
                  purchaseOrder={inventoryReceipt.purchaseOrder}
                  supplier={inventoryReceipt.supplier}
                  client={inventoryReceipt.client}
                  purchaseRequest={inventoryReceipt.purchaseRequest}
                  productionOrder={inventoryReceipt.productionOrder}
                />
              }
            />
            <MetaField
              label="Loại phiếu"
              value={
                <span className="inline-flex items-center gap-2">
                  {inventoryReceiptTypeLabels[inventoryReceipt.receiptType]}
                  <InventoryReceiptItemTypeBadge
                    receiptType={inventoryReceipt.receiptType}
                  />
                </span>
              }
            />
            <MetaField
              label="Loại tài sản"
              value={
                inventoryReceiptAssetTypeLabels[inventoryReceipt.assetType]
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ngày nhập"
              value={DateTime.fromISO(inventoryReceipt.receiptDate, {
                zone: "utc",
              }).toFormat("dd/MM/yyyy")}
            />
            <MetaField
              label="Người tạo"
              value={inventoryReceipt.creatorBy?.fullName ?? "—"}
            />
            <MetaField
              label="Người xác nhận"
              value={inventoryReceipt.posterBy?.fullName ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ghi chú"
              value={inventoryReceipt.note ?? "Không có ghi chú"}
            />
          </div>
        </div>
      </div>

      <InventoryReceiptDetailActions inventoryReceipt={inventoryReceipt} />
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
