import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import { InventoryReceiptCreateGenericItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateGenericItemsSection"
import { InventoryReceiptCreatePurchaseOrderItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreatePurchaseOrderItemsSection"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

// Dispatcher giữa 2 chế độ chọn dòng vật tư — theo PO (đã chọn `purchaseOrderId` ở header) hay
// chọn tay (mặc định). Xem plan Phần 4.
export const InventoryReceiptCreateItemsSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    return purchaseOrderId ? (
      <InventoryReceiptCreatePurchaseOrderItemsSection
        form={form}
        disabled={disabled}
      />
    ) : (
      <InventoryReceiptCreateGenericItemsSection
        form={form}
        disabled={disabled}
      />
    )
  },
})
