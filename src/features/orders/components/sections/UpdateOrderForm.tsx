import { useMemo, useState } from "react"
import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
import type { Key } from "react-aria-components"
import type { FieldPath, SubmitErrorHandler } from "react-hook-form"
import type { UpdateOrderWizardStep } from "@/features/orders/components/sections/UpdateOrderStepsTabs"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"
import { buildSelectOption } from "@/lib/utils"

// Field nào thuộc bước nào — dùng để form.trigger() chỉ đúng field của bước đang đứng khi bấm
// "Tiếp theo", và để onInvalid dưới tìm đúng bước cần nhảy về khi submit lỗi. `orderId` không
// render ở bước nào (không cho sửa) nhưng vẫn liệt kê để mọi field của schema thuộc đúng 1 bước.
const stepFields: Record<
  UpdateOrderWizardStep,
  FieldPath<UpdateOrderSchema>[]
> = {
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

// Vỏ wizard "Cập nhật đơn hàng" — 4 bước, đồng bộ với CreateOrderForm.tsx. Khác Tạo: không
// furthestStep (mọi tab mở sẵn — đơn đã tồn tại và hợp lệ từ server), không draft, không
// "Đặt lại"/"Lưu nháp", submit xong ở lại trang (không điều hướng đi).
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

  // defaultValues chỉ đọc 1 lần lúc mount. Không form.reset theo `order`/`items`: onSuccess
  // invalidate ["orders"] khiến 2 giá trị này đổi tham chiếu ngay sau khi lưu — reset theo đó sẽ
  // xoá mất chỉnh sửa dở dang của người dùng trong lúc refetch đang chạy.
  const form = useForm<UpdateOrderSchema>({
    resolver: zodResolver(updateOrderSchema, undefined, { raw: true }),
    defaultValues: getOrderDefaultValues(order, items),
    // Cùng lý do đã fix bên CreateOrderForm.tsx: wizard validate theo bước bằng form.trigger(),
    // không gọi handleSubmit() cho tới bước cuối, nên mode mặc định "onSubmit" sẽ để lỗi đỏ dính
    // lại sau khi sửa xong 1 field cho tới khi trigger() chạy lại. "onChange" xác nhận lại ngay.
    mode: "onChange",
  })

  // ComboboxField so `initialOption` theo tham chiếu để quyết định seed lại cache nhãn — memo
  // hoá để tránh 1 object mới mỗi lần UpdateOrderForm render lại. `assignedUserId` không dùng
  // được buildSelectOption: OrderUserRef chỉ có `.fullName`, không có `.name` như
  // buildSelectOption yêu cầu.
  const initialClientOption = useMemo(
    () => buildSelectOption(order.client),
    [order.client]
  )
  const initialAssigneeOption = useMemo(
    () =>
      order.assignedUser
        ? { value: order.assignedUser.id, label: order.assignedUser.fullName }
        : undefined,
    [order.assignedUser]
  )

  const [step, setStep] = useState<UpdateOrderWizardStep>("info")

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back without a
  // cast. Không có furthestStep để khoá — mọi tab đã mở sẵn (xem UpdateOrderStepsTabs.tsx).
  function handleStepChange(key: Key) {
    const nextStep = updateOrderStepItems.find(
      (item) => item.value === String(key)
    )
    if (nextStep) setStep(nextStep.value)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    updateOrderStepItems,
    step
  )

  async function goNext() {
    if (!nextStep) return
    const valid = await form.trigger(stepFields[step])
    if (!valid) return
    setStep(nextStep)
  }

  // Submit lỗi (vd bấm tab nhảy tới bước cuối rồi submit thẳng) → nhảy về đúng bước chứa field
  // lỗi đầu tiên, không thì lỗi hiện trên 1 panel đã unmount, người dùng không thấy gì.
  const onInvalid: SubmitErrorHandler<UpdateOrderSchema> = (errors) => {
    const badStep = updateOrderStepItems.find((item) =>
      stepFields[item.value].some((name) => name in errors)
    )
    if (badStep) setStep(badStep.value)
    else toast.error("Dữ liệu đơn hàng không hợp lệ")
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => update(values), onInvalid)}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs
        selectedKey={step}
        onSelectionChange={handleStepChange}
        className="gap-0"
      >
        <UpdateOrderStepsTabs />

        <TabsContent id="info" className="m-0 outline-none">
          <UpdateOrderInfoSection
            form={form}
            disabled={isPending}
            orderCode={order.code}
            initialClientOption={initialClientOption}
            initialAssigneeOption={initialAssigneeOption}
          />
        </TabsContent>
        <TabsContent id="selectItems" className="m-0 outline-none">
          <UpdateOrderSelectItemsStep form={form} />
        </TabsContent>
        <TabsContent id="itemQuantities" className="m-0 outline-none">
          <UpdateOrderQuantitiesStep form={form} disabled={isPending} />
        </TabsContent>
        <TabsContent id="confirm" className="m-0 outline-none">
          <UpdateOrderConfirmSection form={form} disabled={isPending} />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
        {prevStep ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            isDisabled={isPending}
            onPress={() => setStep(prevStep)}
          >
            <ArrowLeft className="size-4" />
            {prevLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
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
        )}

        {nextStep ? (
          // key ép React unmount/remount thay vì tái dùng cùng node DOM khi đổi sang nhánh dưới —
          // goNext() là async (await form.trigger()), nên nếu tái dùng node, type có thể đổi
          // button→submit ngay giữa lúc 1 cú click thật đang diễn ra (mousedown đã bắn, mouseup
          // chưa tới), khiến click đó vô tình submit luôn form. Đã tự tay bắt được lỗi này khi
          // test bước③→④.
          <Button
            key="next"
            type="button"
            isDisabled={isPending}
            onPress={() => void goNext()}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            key="submit"
            type="submit"
            isDisabled={form.formState.isSubmitting || isPending}
          >
            {form.formState.isSubmitting || isPending ? (
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
      </div>
    </form>
  )
}
