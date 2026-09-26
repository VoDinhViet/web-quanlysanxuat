import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import { UpdateInventoryReceiptGenericItemsSection } from "@/features/inventory-receipts/components/sections/UpdateInventoryReceiptGenericItemsSection"
import { UpdateInventoryReceiptPurchaseOrderItemsSection } from "@/features/inventory-receipts/components/sections/UpdateInventoryReceiptPurchaseOrderItemsSection"
import { updateInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"

// Bản update của InventoryReceiptItemsSection.tsx (dispatcher theo có/không `purchaseOrderId`).
export const UpdateInventoryReceiptItemsSection = withForm({
  defaultValues: updateInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    return purchaseOrderId ? (
      <UpdateInventoryReceiptPurchaseOrderItemsSection
        form={form}
        disabled={disabled}
      />
    ) : (
      <UpdateInventoryReceiptGenericItemsSection
        form={form}
        disabled={disabled}
      />
    )
  },
})
