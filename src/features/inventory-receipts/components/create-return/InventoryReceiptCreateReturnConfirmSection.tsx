import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { InventoryReceiptStatusBadge } from "@/features/inventory-receipts/components/InventoryReceiptBadges"
import { createInventoryReceiptReturnFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { clientQueryOptions } from "@/features/clients/api"
import { withForm } from "@/hooks/use-app-form"
import {
  InventoryReceiptAssetType,
  InventoryReceiptStatus,
  inventoryReceiptAssetTypeLabels,
  inventoryReceiptStatusDescriptions,
} from "@/lib/types/inventory-receipt.type"

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

// Bước ③ — xem lại thông tin phiếu sẽ tạo trước khi Lưu nháp/Xác nhận, cùng khuôn
// InventoryReceiptCreateOtherConfirmSection.tsx. Khác "Khác": có 1 field suy từ fetch riêng
// (`clientQueryOptions`, lấy tên khách hàng để hiển thị — form state chỉ giữ `clientId`), cùng
// cách InventoryReceiptCreateFromPoConfirmSection.tsx fetch supplierQueryOptions.
export const InventoryReceiptCreateReturnConfirmSection = withForm({
  defaultValues: createInventoryReceiptReturnFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form }) {
    const receiptDate = useField({ form, name: "receiptDate" }).state.value
    const assetType = useField({ form, name: "assetType" }).state.value
    const clientId = useField({ form, name: "clientId" }).state.value
    const note = useField({ form, name: "note" }).state.value
    const requiresIqc = useField({ form, name: "requiresIqc" }).state.value

    const { data: client } = useQuery({
      ...clientQueryOptions(clientId),
      enabled: Boolean(clientId),
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Lưu nháp hoặc xác nhận
          </h2>
          <p className="text-sm text-muted-foreground">
            Kiểm tra lại thông tin phiếu trước khi lưu.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PreviewField label="Nguồn nhập" value="Nhập từ khách hàng" />
          <PreviewField
            label="Loại tài sản"
            value={
              inventoryReceiptAssetTypeLabels[
                assetType ?? InventoryReceiptAssetType.CLIENT
              ]
            }
          />
          <PreviewField
            label="Ngày nhập"
            value={
              receiptDate
                ? DateTime.fromISO(receiptDate).toFormat("dd/MM/yyyy")
                : "—"
            }
          />
          <PreviewField
            label="Khách hàng cung cấp"
            value={client?.name ?? "—"}
          />
          <PreviewField
            label="Yêu cầu QC (IQC)"
            value={requiresIqc ? "Có" : "Không"}
          />
          <PreviewField label="Ghi chú" value={note || "Không có"} />
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
          nếu bạn bấm Xác nhận — đổi lựa chọn "Yêu cầu QC" ở bước ① nếu muốn
          khác.
        </p>
      </div>
    )
  },
})
