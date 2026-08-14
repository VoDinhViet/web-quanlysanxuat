import { DateTime } from "luxon"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { InventoryReceiptUpdateHeaderSection } from "@/features/inventory-receipts/components/update/InventoryReceiptUpdateHeaderSection"
import { InventoryReceiptUpdateItemsSection } from "@/features/inventory-receipts/components/update/InventoryReceiptUpdateItemsSection"
import { updateInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/update-inventory-receipt.api"
import { updateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import type { UpdateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptUpdateFormProps = {
  detail: InventoryReceiptDetail
}

// updateInventoryReceipt trả void — không có gì mới để hiển thị ngoài chính state đã sửa, nên
// onSuccess ở lại trang này (invalidate + toast) thay vì điều hướng, cùng cách UpdateOrderForm.tsx
// làm ("sửa phiếu thường qua nhiều lượt", nút "Quay lại" phía trên form mới là lối ra).
export function InventoryReceiptUpdateForm({
  detail,
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

  const defaultValues: UpdateInventoryReceiptSchema = {
    receiptId: detail.id,
    receiptType: detail.receiptType,
    receiptDate: DateTime.fromISO(detail.receiptDate, { zone: "utc" }).toFormat(
      "yyyy-MM-dd"
    ),
    supplierId: detail.supplier?.id ?? "",
    purchaseRequestId: detail.purchaseRequest?.id ?? "",
    productionOrderId: detail.productionOrder?.id ?? "",
    purchaseOrderId: detail.purchaseOrder?.id ?? "",
    note: detail.note ?? "",
    items: detail.items.map((item) => ({
      itemId: item.item.id,
      itemLabel: `${item.item.code} — ${item.item.name}`,
      itemUnit: "",
      purchaseOrderItemId: item.purchaseOrderItem?.id ?? "",
      quantity: String(item.quantity),
      unitPrice: item.unitPrice !== null ? String(item.unitPrice) : "",
      note: item.note ?? "",
    })),
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: updateInventoryReceiptSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại chi tiết phiếu nhập kho"
            asChild
          >
            <Link
              to="/manage/inventory-receipts/$inventoryReceiptId"
              params={{ inventoryReceiptId: detail.id }}
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <InventoryReceiptUpdateHeaderSection
          form={form}
          disabled={isPending}
          receiptCode={detail.code}
          warehouseName={detail.warehouse.name}
          initialSupplier={
            detail.supplier
              ? { value: detail.supplier.id, label: detail.supplier.name }
              : undefined
          }
          initialPurchaseOrder={
            detail.purchaseOrder
              ? {
                  value: detail.purchaseOrder.id,
                  label: detail.purchaseOrder.code,
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
          disabled={isPending}
          onClick={() =>
            void navigate({
              to: "/manage/inventory-receipts/$inventoryReceiptId",
              params: { inventoryReceiptId: detail.id },
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
              disabled={!canSubmit || isSubmitting || isPending}
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
