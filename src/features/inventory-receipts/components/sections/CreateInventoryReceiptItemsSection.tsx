import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import { CreateInventoryReceiptGenericItemsSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptGenericItemsSection"
import { CreateInventoryReceiptPurchaseOrderItemsSection } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptPurchaseOrderItemsSection"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

// Dispatcher giữa 2 chế độ chọn dòng vật tư — theo PO (đã chọn `purchaseOrderId` ở header) hay
// chọn tay (mặc định). Xem plan Phần 4.
export const CreateInventoryReceiptItemsSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    return purchaseOrderId ? (
      <CreateInventoryReceiptPurchaseOrderItemsSection
        form={form}
        disabled={disabled}
      />
    ) : (
      <CreateInventoryReceiptGenericItemsSection
        form={form}
        disabled={disabled}
      />
    )
  },
})
