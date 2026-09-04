import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { InventoryReceiptUpdateHeaderSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptUpdateHeaderSection"
import { InventoryReceiptUpdateItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptUpdateItemsSection"
import { updateInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/update-inventory-receipt.api"
import { updateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import type { UpdateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

function getInventoryReceiptDefaultValues(
  inventoryReceipt: InventoryReceiptDetail
): UpdateInventoryReceiptSchema {
  return {
    receiptId: inventoryReceipt.id,
    receiptType: inventoryReceipt.receiptType,
    receiptDate: DateTime.fromISO(inventoryReceipt.receiptDate, {
      zone: "utc",
    }).toFormat("yyyy-MM-dd"),
    supplierId: inventoryReceipt.supplier?.id ?? "",
    clientId: inventoryReceipt.client?.id ?? "",
    purchaseRequestId: inventoryReceipt.purchaseRequest?.id ?? "",
    productionOrderId: inventoryReceipt.productionOrder?.id ?? "",
    productionJobId: inventoryReceipt.productionJob?.id ?? "",
    purchaseOrderId: inventoryReceipt.purchaseOrder?.id ?? "",
    note: inventoryReceipt.note ?? "",
    items: inventoryReceipt.items.map((item) => ({
      itemId: item.item.id,
      itemLabel: `${item.item.code} — ${item.item.name}`,
      itemUnit: "",
      purchaseOrderItemId: item.purchaseOrderItem?.id ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? undefined,
      note: item.note ?? "",
    })),
  }
}

type InventoryReceiptUpdateFormProps = {
  inventoryReceipt: InventoryReceiptDetail
}

// updateInventoryReceipt trả void — không có gì mới để hiển thị ngoài chính state đã sửa, nên
// onSuccess ở lại trang này (invalidate + toast) thay vì điều hướng, cùng cách UpdateOrderForm.tsx
// làm ("sửa phiếu thường qua nhiều lượt", nút "Quay lại" phía trên form mới là lối ra).
export function InventoryReceiptUpdateForm({
  inventoryReceipt,
}: InventoryReceiptUpdateFormProps) {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/$inventoryReceiptId/update",
  })
  const queryClient = useQueryClient()
  const updateInventoryReceiptFn = useServerFn(updateInventoryReceipt)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateInventoryReceiptSchema) =>
      updateInventoryReceiptFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
      toast.success("Đã cập nhật phiếu nhập kho")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getInventoryReceiptDefaultValues(inventoryReceipt),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateInventoryReceiptSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <LinkButton
            to="/manage/inventory-receipts/$inventoryReceiptId"
            params={{ inventoryReceiptId: inventoryReceipt.id }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại chi tiết phiếu nhập kho"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </LinkButton>
        </div>

        <InventoryReceiptUpdateHeaderSection
          form={form}
          disabled={isPending}
          receiptCode={inventoryReceipt.code}
          initialSupplier={
            inventoryReceipt.supplier
              ? {
                  value: inventoryReceipt.supplier.id,
                  label: inventoryReceipt.supplier.name,
                }
              : undefined
          }
          initialClient={
            inventoryReceipt.client
              ? {
                  value: inventoryReceipt.client.id,
                  label: inventoryReceipt.client.name,
                }
              : undefined
          }
          initialPurchaseOrder={
            inventoryReceipt.purchaseOrder
              ? {
                  value: inventoryReceipt.purchaseOrder.id,
                  label: inventoryReceipt.purchaseOrder.code,
                }
              : undefined
          }
          initialProductionJob={
            inventoryReceipt.productionJob
              ? {
                  value: inventoryReceipt.productionJob.id,
                  label: inventoryReceipt.productionJob.code,
                }
              : undefined
          }
        />

        <div className="border-t border-border">
          <InventoryReceiptUpdateItemsSection
            form={form}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
        <Button
          type="button"
          variant="outline"
          isDisabled={isPending}
          onPress={() =>
            void navigate({
              to: "/manage/inventory-receipts/$inventoryReceiptId",
              params: { inventoryReceiptId: inventoryReceipt.id },
            })
          }
        >
          Hủy
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              isDisabled={!canSubmit || isSubmitting || isPending}
            >
              {isSubmitting || isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang lưu
                </>
              ) : (
                <>
                  <Save />
                  Lưu thay đổi
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
