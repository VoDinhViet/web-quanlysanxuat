import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import { InventoryReceiptUpdateGenericItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptUpdateGenericItemsSection"
import { InventoryReceiptUpdatePurchaseOrderItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptUpdatePurchaseOrderItemsSection"
import { updateInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"

// Bản update của InventoryReceiptItemsSection.tsx (dispatcher theo có/không `purchaseOrderId`).
export const InventoryReceiptUpdateItemsSection = withForm({
  defaultValues: updateInventoryReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    return purchaseOrderId ? (
      <InventoryReceiptUpdatePurchaseOrderItemsSection
        form={form}
        disabled={disabled}
      />
    ) : (
      <InventoryReceiptUpdateGenericItemsSection
        form={form}
        disabled={disabled}
      />
    )
  },
})
