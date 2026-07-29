import { DateTime } from "luxon"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateOrderInfoSection } from "@/features/orders/components/update/UpdateOrderInfoSection"
import { UpdateOrderItemsSection } from "@/features/orders/components/update/UpdateOrderItemsSection"
import { UpdateOrderTotalsSummary } from "@/features/orders/components/update/UpdateOrderTotalsSummary"
import { OrderAttachmentsField } from "@/features/orders/components/OrderAttachmentsField"
import { updateOrder } from "@/features/orders/api/server-functions/update-order.api"
import { updateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import type { OrderDetail } from "@/lib/types/order.type"

type UpdateOrderFormProps = {
  order: OrderDetail
}

export function UpdateOrderForm({ order }: UpdateOrderFormProps) {
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

  // OrderDetail → raw form values: nullable fields become "", ISO datetimes become the
  // yyyy-MM-dd strings the date pickers work with. {zone:"utc"} is the exact inverse of
  // toIsoDate (which writes out midnight UTC) — without it, reading back in a negative
  // offset loses a day. `items`/`attachments` carry the UI-only display fields
  // (productLabel/productUnit, file metadata) that orderItemFormSchema/the update server
  // function strip back out before the payload reaches the wire.
  const defaultValues: UpdateOrderSchema = {
    orderId: order.id,
    clientId: order.client.id,
    contactName: order.contactName ?? "",
    contactPhone: order.contactPhone ?? "",
    contactEmail: order.contactEmail ?? "",
    staffId: order.staff?.id ?? "",
    orderDate: DateTime.fromISO(order.orderDate, { zone: "utc" }).toFormat(
      "yyyy-MM-dd"
    ),
    dueDate: order.dueDate
      ? DateTime.fromISO(order.dueDate, { zone: "utc" }).toFormat("yyyy-MM-dd")
      : "",
    deliveryAddress: order.deliveryAddress ?? "",
    paymentTerm: order.paymentTerm ?? "",
    currency: order.currency,
    exchangeRate: String(order.exchangeRate),
    discountType: order.discountType,
    discountValue: String(order.discountValue),
    vatPercent: String(order.vatPercent),
    shippingFee: String(order.shippingFee),
    status: order.status,
    note: order.note ?? "",
    internalNote: order.internalNote ?? "",
    items: order.items.map((item) => ({
      productId: item.product.id,
      productLabel: item.product.name,
      productUnit: item.product.unit.name,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      discountPercent: String(item.discountPercent),
      note: item.note ?? "",
      status: item.status,
    })),
    attachments: order.attachments.map((attachment) => attachment.file),
  }

  const form = useAppForm({
    defaultValues,
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
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <div className="border-b border-border px-4 py-3 sm:px-5">
            <Button
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại chi tiết đơn hàng"
              asChild
            >
              <Link to="/manage/orders/$orderId" params={{ orderId: order.id }}>
                <ArrowLeft className="size-4" />
                Quay lại
              </Link>
            </Button>
          </div>

          <UpdateOrderInfoSection
            form={form}
            disabled={isPending}
            orderCode={order.code}
            selectedClient={{
              value: order.client.id,
              label: order.client.name,
            }}
          />

          <div className="border-t border-border">
            <UpdateOrderItemsSection form={form} disabled={isPending} />
          </div>

          <div className="border-t border-border px-4 py-5 sm:px-5">
            <form.Field name="attachments">
              {(field) => (
                <OrderAttachmentsField
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
          disabled={isPending}
          onClick={() =>
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
