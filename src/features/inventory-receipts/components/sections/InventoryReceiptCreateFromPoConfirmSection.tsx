import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { InventoryReceiptStatusBadge } from "@/features/inventory-receipts/components/primitives/InventoryReceiptBadges"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { supplierQueryOptions } from "@/features/suppliers/api"
import { withForm } from "@/hooks/use-app-form"
import {
  InventoryReceiptStatus,
  inventoryReceiptAssetTypeLabels,
  inventoryReceiptStatusDescriptions,
} from "@/lib/types/inventory-receipt.type"
import { getPrimaryRepresentative } from "@/lib/types/supplier.type"

const previewStatuses = [
  InventoryReceiptStatus.DRAFT,
  InventoryReceiptStatus.PENDING_RECEIPT,
  InventoryReceiptStatus.PENDING_IQC,
] as const

type PreviewFieldProps = {
  label: string
  value: string
}

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// Bước ④ — xem lại thông tin phiếu sẽ tạo trước khi Lưu nháp/Xác nhận. Mọi field ở đây tự suy ra
// từ PO đã chọn (không có ô nhập tay nào trong 4 bước, xem plan's Context) — kho nhận/NCC/PO từ
// purchaseOrderQueryOptions (đã fetch ở bước ②, React Query dedupe nên không tốn round-trip
// thêm), liên hệ/điện thoại từ supplierQueryOptions (đại diện chính, hoặc đại diện đầu tiên nếu
// không có ai được đánh dấu chính; số điện thoại fallback về số của chính NCC nếu đại diện không
// có số riêng). Ngày nhập luôn là hôm nay — wizard không có bước chọn ngày chứng từ.
export const InventoryReceiptCreateFromPoConfirmSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value
    const requiresIqc =
      useField({ form, name: "requiresIqc" }).state.value === "yes"
    const assetType = useField({ form, name: "assetType" }).state.value

    const { data: purchaseOrder } = useQuery({
      ...purchaseOrderQueryOptions(purchaseOrderId),
      enabled: Boolean(purchaseOrderId),
    })
    const { data: supplier } = useQuery({
      ...supplierQueryOptions(purchaseOrder?.supplier.id ?? ""),
      enabled: Boolean(purchaseOrder),
    })

    const representative = supplier
      ? getPrimaryRepresentative(supplier.representatives)
      : undefined

    const today = DateTime.now().toFormat("dd/MM/yyyy HH:mm")

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ④ Lưu nháp hoặc xác nhận
          </h2>
          <p className="text-sm text-muted-foreground">
            Kiểm tra lại thông tin phiếu trước khi lưu.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PreviewField label="Nguồn nhập" value="Từ PO (Nhà cung cấp)" />
          <PreviewField
            label="Loại tài sản"
            value={inventoryReceiptAssetTypeLabels[assetType]}
          />
          <PreviewField label="Ngày nhập (dự kiến)" value={today} />
          <PreviewField
            label="PO / Lý do"
            value={
              purchaseOrder
                ? `${purchaseOrder.code} — ${purchaseOrder.supplier.name}`
                : "—"
            }
          />
          <PreviewField
            label="Nhà cung cấp"
            value={purchaseOrder?.supplier.name ?? "—"}
          />
          <PreviewField
            label="Kho nhận"
            value={purchaseOrder?.receiptWarehouse?.name ?? "—"}
          />
          <PreviewField label="Liên hệ" value={representative?.name ?? "—"} />
          <PreviewField
            label="Điện thoại"
            value={representative?.phoneNumber ?? supplier?.phoneNumber ?? "—"}
          />
        </div>

        <div className="mt-4 rounded-md bg-muted/30 p-4">
          <p className="text-xs font-semibold text-foreground">
            Ý nghĩa trạng thái
          </p>
          <ul className="mt-2 space-y-1.5">
            {previewStatuses.map((status) => (
              <li key={status} className="flex items-start gap-2 text-xs">
                <InventoryReceiptStatusBadge
                  status={status}
                  className="mt-0.5 shrink-0 text-[10px]"
                />
                <span className="text-muted-foreground">
                  {inventoryReceiptStatusDescriptions[status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Phiếu sẽ ở trạng thái{" "}
          <strong className="font-medium text-foreground">
            {requiresIqc ? "Chờ IQC" : "Chờ nhập kho"}
          </strong>{" "}
          nếu bạn bấm Xác nhận — đổi lựa chọn "Yêu cầu QC" ở bước ③ nếu muốn
          khác.
        </p>
      </div>
    )
  },
})
