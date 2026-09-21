import { useMemo, useState } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import type { DeepKeys } from "@tanstack/react-form"
import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateOrderConfirmSection } from "@/features/orders/components/sections/UpdateOrderConfirmSection"
import { UpdateOrderInfoSection } from "@/features/orders/components/sections/UpdateOrderInfoSection"
import { UpdateOrderQuantitiesStep } from "@/features/orders/components/sections/UpdateOrderQuantitiesStep"
import { UpdateOrderSelectItemsStep } from "@/features/orders/components/sections/UpdateOrderSelectItemsStep"
import {
  updateOrderStepItems,
  UpdateOrderStepsTabs,
} from "@/features/orders/components/sections/UpdateOrderStepsTabs"
import { updateOrder } from "@/features/orders/api/server-functions/update-order.api"
import { updateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { getStepNav } from "@/lib/wizard-steps"
import type { UpdateOrderWizardStep } from "@/features/orders/components/sections/UpdateOrderStepsTabs"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"

// Field nào thuộc bước nào — chỉ còn dùng để tìm bước cần nhảy về khi submit lỗi (TanStack Form
// không có form.trigger() để validate riêng 1 bước trước "Tiếp theo", xem CreateOrderForm.tsx).
// `orderId` không render ở bước nào (không cho sửa) nhưng vẫn liệt kê để mọi field của schema
// thuộc đúng 1 bước.
const stepFields: Record<UpdateOrderWizardStep, DeepKeys<UpdateOrderSchema>[]> =
  {
    info: [
      "orderId",
      "clientId",
      "assignedUserId",
      "status",
      "orderDate",
      "dueDate",
      "consigneeAddress",
      "paymentTerm",
      "currency",
      "exchangeRate",
      "note",
      "internalNote",
    ],
    selectItems: [],
    itemQuantities: ["items"],
    confirm: [
      "discountType",
      "discountValue",
      "vatPercent",
      "shippingFee",
      "files",
    ],
  }

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

// Vỏ wizard "Cập nhật đơn hàng" — 4 bước, TanStack Form thay react-hook-form (đồng bộ với
// CreateOrderForm.tsx, không còn feature RHF thử nghiệm nào trong repo, xem forms-and-ui.md).
// Khác Tạo: không furthestStep/canGoToSelectItems (đơn đã tồn tại và hợp lệ từ server, mọi tab
// mở sẵn — UpdateOrderStepsTabs.tsx), không draft, không "Đặt lại"/"Lưu nháp", submit xong ở lại
// trang (không điều hướng đi). "Tiếp theo" không còn form.trigger() để validate trước khi qua
// bước kế (không tồn tại ở TanStack Form) — chỉ đổi step ngay, vì tab strip đã mở sẵn nên người
// dùng có thể nhảy thẳng qua đó bất cứ lúc nào; bù lại, submit lỗi vẫn nhảy về đúng bước chứa
// field lỗi đầu tiên qua getFieldMeta (thay onInvalid của RHF).
export function UpdateOrderForm({ order, items }: UpdateOrderFormProps) {
  const navigate = useNavigate({ from: "/manage/orders/$orderId/update" })
  const queryClient = useQueryClient()
  const updateOrderFn = useServerFn(updateOrder)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOrderSchema) => updateOrderFn({ data: value }),
    // Stay on the page: editing an order is often several passes over the
    // same record, and the totals panel already labels itself "số liệu tạm
    // tính" — the settled numbers live on the detail page. The "Hủy" button
    // in the wizard's action bar at bước ① is the way out.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Đã cập nhật đơn hàng")
    },
    onError: (error) => toast.error(error.message),
  })

  // defaultValues chỉ đọc 1 lần lúc mount (useMemo, không tính lại mỗi render) — cùng lý do
  // RHF bản cũ không form.reset theo `order`/`items`: onSuccess invalidate ["orders"] khiến 2
  // giá trị này đổi tham chiếu ngay sau khi lưu, reset theo đó sẽ xoá mất chỉnh sửa dở dang của
  // người dùng trong lúc refetch đang chạy.
  const defaultValues = useMemo(
    () => getOrderDefaultValues(order, items),
    [order, items]
  )

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateOrderSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  // ComboboxField so `initialOption` theo tham chiếu để quyết định seed lại cache nhãn — memo
  // hoá để tránh 1 object mới mỗi lần UpdateOrderForm render lại. `assignedUserId` không dùng
  // được buildSelectOption: OrderUserRef chỉ có `.fullName`, không có `.name` như
  // buildSelectOption yêu cầu. `clientId` không cần initialOption nữa — ClientPicker tự fetch
  // nhãn theo `value` (clientQueryOptions), xem ClientPicker.tsx.
  const initialAssigneeOption = useMemo(
    () =>
      order.assignedUser
        ? { value: order.assignedUser.id, label: order.assignedUser.fullName }
        : undefined,
    [order.assignedUser]
  )

  const [step, setStep] = useState<UpdateOrderWizardStep>("info")

  // Không có furthestStep để khoá — mọi tab đã mở sẵn (xem UpdateOrderStepsTabs.tsx).
  function handleStepChange(value: string | null) {
    const nextStep = updateOrderStepItems.find((item) => item.value === value)
    if (nextStep) setStep(nextStep.value)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    updateOrderStepItems,
    step
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        void form.handleSubmit().then(() => {
          if (form.state.isValid) return

          // Submit lỗi (vd đứng ở bước cuối rồi bấm Lưu thẳng) → nhảy về đúng bước chứa field
          // lỗi đầu tiên, không thì lỗi hiện trên 1 panel đã unmount, người dùng không thấy gì.
          const badStep = updateOrderStepItems.find((item) =>
            stepFields[item.value].some(
              (name) => (form.getFieldMeta(name)?.errors.length ?? 0) > 0
            )
          )
          if (badStep) setStep(badStep.value)
          else toast.error("Dữ liệu đơn hàng không hợp lệ")
        })
      }}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs value={step} onValueChange={handleStepChange} className="gap-0">
        <UpdateOrderStepsTabs />

        <TabsContent value="info" className="m-0 outline-none">
          <UpdateOrderInfoSection
            form={form}
            disabled={isPending}
            orderCode={order.code}
            initialAssigneeOption={initialAssigneeOption}
          />
        </TabsContent>
        <TabsContent value="selectItems" className="m-0 outline-none">
          <UpdateOrderSelectItemsStep form={form} />
        </TabsContent>
        <TabsContent value="itemQuantities" className="m-0 outline-none">
          <UpdateOrderQuantitiesStep form={form} disabled={isPending} />
        </TabsContent>
        <TabsContent value="confirm" className="m-0 outline-none">
          <UpdateOrderConfirmSection form={form} disabled={isPending} />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
        {prevStep ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() => setStep(prevStep)}
          >
            <ArrowLeft className="size-4" />
            {prevLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
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
        )}

        {nextStep ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => setStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
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
        )}
      </div>
    </form>
  )
}
