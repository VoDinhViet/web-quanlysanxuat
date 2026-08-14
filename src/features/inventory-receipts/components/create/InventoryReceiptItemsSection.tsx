import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import { InventoryReceiptGenericItemsSection } from "@/features/inventory-receipts/components/create/InventoryReceiptGenericItemsSection"
import { InventoryReceiptPurchaseOrderItemsSection } from "@/features/inventory-receipts/components/create/InventoryReceiptPurchaseOrderItemsSection"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

// Dispatcher giữa 2 chế độ chọn dòng vật tư — theo PO (đã chọn `purchaseOrderId` ở header) hay
// chọn tay (mặc định). Xem plan Phần 4.
export const InventoryReceiptItemsSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    return purchaseOrderId ? (
      <InventoryReceiptPurchaseOrderItemsSection
        form={form}
        disabled={disabled}
      />
    ) : (
      <InventoryReceiptGenericItemsSection form={form} disabled={disabled} />
    )
  },
})
