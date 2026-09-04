import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { OrderDocumentsField } from "@/features/orders/components/composites/OrderDocumentsField"
import { UpdateOrderInfoSection } from "@/features/orders/components/sections/UpdateOrderInfoSection"
import { UpdateOrderItemsSection } from "@/features/orders/components/sections/UpdateOrderItemsSection"
import { UpdateOrderTotalsSummary } from "@/features/orders/components/composites/UpdateOrderTotalsSummary"
import { updateOrder } from "@/features/orders/api/server-functions/update-order.api"
import { updateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"
import { buildSelectOption } from "@/lib/utils"

// OrderDetail → raw form values: nullable fields become "", ISO datetimes become the
// yyyy-MM-dd strings the date pickers work with. {zone:"utc"} is the exact inverse of
// toIsoDate (which writes out midnight UTC) — without it, reading back in a negative
// offset loses a day. `items`/`files` carry the UI-only display fields
// (itemLabel/itemUnit, file metadata) that orderItemFormSchema/the update server
// function strip back out before the payload reaches the wire.
function getOrderDefaultValues(
  order: OrderDetail,
  items: OrderItem[]
): UpdateOrderSchema {
  return {
    orderId: order.id,
    clientId: order.client?.id ?? "",
    assignedUserId: order.assignedUser?.id ?? "",
    orderDate: DateTime.fromISO(order.orderDate, { zone: "utc" }).toFormat(
      "yyyy-MM-dd"
    ),
    dueDate: order.dueDate
      ? DateTime.fromISO(order.dueDate, { zone: "utc" }).toFormat("yyyy-MM-dd")
      : "",
    consigneeAddress: order.consigneeAddress ?? "",
    paymentTerm: order.paymentTerm ?? "",
    currency: order.currency,
    exchangeRate: order.exchangeRate,
    discountType: order.discountType,
    discountValue: order.discountValue,
    vatPercent: order.vatPercent,
    shippingFee: order.shippingFee,
    // Editing a REJECTED order reverts it to DRAFT server-side (OrdersService.updateOrder) — the
    // form shows that outcome up front rather than the stale REJECTED value.
    status:
      order.status === OrderStatus.REJECTED ? OrderStatus.DRAFT : order.status,
    note: order.note ?? "",
    internalNote: order.internalNote ?? "",
    items: items.map((item) => ({
      itemId: item.item.id,
      itemLabel: item.item.name,
      itemUnit: item.unit.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      note: item.note ?? "",
      status: item.status,
    })),
    files: order.files.map((orderFile) => orderFile.file),
  }
}

type UpdateOrderFormProps = {
  order: OrderDetail
  items: OrderItem[]
}

export function UpdateOrderForm({ order, items }: UpdateOrderFormProps) {
  const navigate = useNavigate({ from: "/manage/orders/$orderId/update" })
  const queryClient = useQueryClient()
  const updateOrderFn = useServerFn(updateOrder)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOrderSchema) => updateOrderFn({ data: value }),
    // Stay on the page: editing an order is often several passes over the
    // same record, and the totals panel already labels itself "số liệu tạm
    // tính" — the settled numbers live on the detail page. The "Quay lại"
    // button above the form is the way out.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Đã cập nhật đơn hàng")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getOrderDefaultValues(order, items),
    validators: {
      onSubmit: updateOrderSchema,
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <div className="border-b border-border px-4 py-3 sm:px-5">
            <LinkButton
              to="/manage/orders/$orderId"
              params={{ orderId: order.id }}
              variant="ghost"
              aria-label="Quay lại chi tiết đơn hàng"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </LinkButton>
          </div>

          <UpdateOrderInfoSection
            form={form}
            disabled={isPending}
            orderCode={order.code}
            selectedClient={buildSelectOption(order.client)}
          />

          <div className="border-t border-border">
            <UpdateOrderItemsSection form={form} disabled={isPending} />
          </div>

          <div className="border-t border-border px-4 py-5 sm:px-5">
            <form.Field name="files">
              {(field) => (
                <OrderDocumentsField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>
        </div>

        <div className="sticky top-6 h-fit rounded-lg bg-card p-4 shadow-card sm:p-5">
          <UpdateOrderTotalsSummary form={form} disabled={isPending} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
        <Button
          type="button"
          variant="outline"
          isDisabled={isPending}
          onPress={() =>
            void navigate({
              to: "/manage/orders/$orderId",
              params: { orderId: order.id },
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
