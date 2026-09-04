import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { updateOutboundOrder } from "@/features/outbound-orders/api/server-functions/update-outbound-order.api"
import { OutboundOrderEditHeaderSection } from "@/features/outbound-orders/components/sections/OutboundOrderEditHeaderSection"
import { OutboundOrderEditItemsSection } from "@/features/outbound-orders/components/sections/OutboundOrderEditItemsSection"
import { updateOutboundOrderSchema } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { UpdateOutboundOrderSchema } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import type {
  OutboundOrderDetail,
  OutboundOrderItem,
} from "@/lib/types/outbound-order.type"

function getOutboundOrderEditDefaultValues(
  order: OutboundOrderDetail,
  items: OutboundOrderItem[]
): UpdateOutboundOrderSchema {
  return {
    outboundOrderId: order.id,
    fulfillmentDate: DateTime.fromISO(order.fulfillmentDate, {
      zone: "utc",
    }).toFormat("yyyy-MM-dd"),
    fulfillmentType: order.fulfillmentType,
    note: order.note ?? "",
    deliveryAddress: order.deliveryAddress ?? "",
    receiverName: order.receiverName ?? "",
    receiverPhone: order.receiverPhone ?? "",
    vehicle: order.vehicle ?? "",
    items: items.map((item) => ({
      orderItemId: item.orderItemId,
      itemId: item.item.id,
      productionJobId: item.productionJob?.id ?? null,
      quantity: item.quantity,
      note: item.note ?? "",
    })),
  }
}

type OutboundOrderEditFormProps = {
  order: OutboundOrderDetail
  items: OutboundOrderItem[]
}

// Sửa edit-inline trên trang Chi tiết (BUG-090) — thay cho trang /update riêng ban đầu. Vỏ phẳng
// (không wizard) khuôn InventoryReceiptUpdateForm.tsx: header + bảng dòng + footer Hủy/Lưu. `Hủy`
// và lúc lưu thành công đều quay về `?mode=view` trên chính route này (state chia sẻ qua URL, xem
// outbound-order-detail-search.schema.ts) — không có route riêng để điều hướng tới/lui.
export function OutboundOrderEditForm({
  order,
  items,
}: OutboundOrderEditFormProps) {
  const navigate = useNavigate({
    from: "/manage/outbound-orders/$outboundOrderId",
  })
  const queryClient = useQueryClient()
  const updateOutboundOrderFn = useServerFn(updateOutboundOrder)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOutboundOrderSchema) =>
      updateOutboundOrderFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
      toast.success("Đã cập nhật phiếu giao hàng")
      await navigate({ search: { mode: "view" } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getOutboundOrderEditDefaultValues(order, items),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateOutboundOrderSchema,
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
    >
      <OutboundOrderEditHeaderSection
        form={form}
        disabled={isPending}
        clientName={order.client.name}
        items={items}
      />

      <OutboundOrderEditItemsSection
        form={form}
        disabled={isPending}
        clientId={order.client.id}
        outboundOrderId={order.id}
        items={items}
      />

      <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-4 sm:px-5">
        <Button
          type="button"
          variant="outline"
          isDisabled={isPending}
          onPress={() => void navigate({ search: { mode: "view" } })}
        >
          Hủy
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
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
                  <Save className="size-4" />
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
