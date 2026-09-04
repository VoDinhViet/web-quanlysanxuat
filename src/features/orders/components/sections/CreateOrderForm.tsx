import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { useFormDraft } from "@/hooks/use-form-draft"
import { CreateOrderConfirmSection } from "@/features/orders/components/sections/CreateOrderConfirmSection"
import { CreateOrderInfoSection } from "@/features/orders/components/sections/CreateOrderInfoSection"
import { CreateOrderQuantitiesStep } from "@/features/orders/components/sections/CreateOrderQuantitiesStep"
import { CreateOrderSelectItemsStep } from "@/features/orders/components/sections/CreateOrderSelectItemsStep"
import {
  createOrderStepItems,
  CreateOrderStepsTabs,
} from "@/features/orders/components/sections/CreateOrderStepsTabs"
import { createOrder } from "@/features/orders/api/server-functions/create-order.api"
import {
  createOrderFormDefaultValues,
  createOrderSchema,
} from "@/features/orders/schemas/create-order.schema"
import { getStepNav } from "@/lib/wizard-steps"
import type { Key } from "react-aria-components"
import type { FieldPath, SubmitErrorHandler } from "react-hook-form"
import type { CreateOrderWizardStep } from "@/features/orders/components/sections/CreateOrderStepsTabs"
import type { CreateOrderSchema } from "@/features/orders/schemas/create-order.schema"

const createOrderStepOrder: CreateOrderWizardStep[] = [
  "info",
  "selectItems",
  "itemQuantities",
  "confirm",
]

// Field nào thuộc bước nào — dùng để form.trigger() chỉ đúng field của bước đang đứng khi bấm
// "Tiếp theo", và để onInvalid dưới tìm đúng bước cần nhảy về khi submit lỗi. Bước "selectItems"
// không có gì bắt buộc để đi tiếp (đơn hàng có thể lưu mà không cần dòng sản phẩm nào) — validate
// thật cho `items` (SL > 0...) chỉ chặn ở bước "itemQuantities", nơi số liệu đó thật sự được nhập.
const stepFields: Record<
  CreateOrderWizardStep,
  FieldPath<CreateOrderSchema>[]
> = {
  info: [
    "clientId",
    "assignedUserId",
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

// Vỏ wizard "Tạo đơn hàng" — 4 bước (CreateOrderStepsTabs.tsx), react-hook-form thay TanStack
// Form (RHF trial thứ 3, xem forms-and-ui.md). Không dùng useFormContext/FormProvider — `form`
// truyền tay xuống từng bước như 1 prop, giống 9 form RHF hiện có trong repo.
export function CreateOrderForm() {
  const navigate = useNavigate({ from: "/manage/orders/create" })
  const queryClient = useQueryClient()
  const createOrderFn = useServerFn(createOrder)

  // v3: field `attachments` đổi tên thành `files` (attachments-to-files-registry rename) — bump
  // để nháp cũ (còn field `attachments`) không âm thầm làm rớt file đã đính kèm khi khôi phục.
  const { draft, saveDraft, clearDraft } = useFormDraft<CreateOrderSchema>(
    "qlsx:draft:create-order-v3"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateOrderSchema) => createOrderFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await navigate({ to: "/manage/orders", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useForm<CreateOrderSchema>({
    resolver: zodResolver(createOrderSchema, undefined, { raw: true }),
    defaultValues: createOrderFormDefaultValues,
    // Mặc định "onSubmit" của RHF chỉ validate lại 1 field sau khi `formState.isSubmitted` đã
    // true — cờ đó chỉ được set bởi `handleSubmit()`, còn wizard này validate theo bước bằng
    // `form.trigger()` (xem goNext dưới), không bao giờ gọi handleSubmit cho tới bước cuối. Kết
    // quả: sửa xong 1 field lỗi ở bước ①/②/③ nhưng lỗi đỏ không tự biến mất cho tới khi bấm
    // "Tiếp theo" gọi trigger() lại — sai UX thật (đã tự tay test thấy). "onChange" xác nhận lại
    // ngay khi field đổi giá trị, bất kể đã submit hay chưa.
    mode: "onChange",
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates. RHF's
  // `reset(values)` refreshes already-mounted field inputs (unlike TanStack Form's — see
  // use-form-draft.ts's `restoreFormDraft`, not needed/used here).
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      form.reset({ ...createOrderFormDefaultValues, ...draft })
    }
  }, [draft, form])

  const [step, setStep] = useState<CreateOrderWizardStep>("info")
  // Bước xa nhất đã qua form.trigger() — khoá tab strip vượt quá nó, chặn nhảy cóc bằng tab.
  const [furthestStep, setFurthestStep] =
    useState<CreateOrderWizardStep>("info")

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back without a
  // cast. Không tự validate khi bấm tab — tab đã bị khoá bởi `reachedStep` ở trên rồi.
  function handleStepChange(key: Key) {
    const nextStep = createOrderStepItems.find(
      (item) => item.value === String(key)
    )
    if (nextStep) setStep(nextStep.value)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createOrderStepItems,
    step
  )

  async function goNext() {
    if (!nextStep) return
    const valid = await form.trigger(stepFields[step])
    if (!valid) return
    setStep(nextStep)
    setFurthestStep((current) =>
      createOrderStepOrder.indexOf(nextStep) >
      createOrderStepOrder.indexOf(current)
        ? nextStep
        : current
    )
  }

  // Submit lỗi (vd bấm tab nhảy tới bước cuối rồi submit thẳng) → nhảy về đúng bước chứa field
  // lỗi đầu tiên, không thì lỗi hiện trên 1 panel đã unmount, người dùng không thấy gì.
  const onInvalid: SubmitErrorHandler<CreateOrderSchema> = (errors) => {
    const badStep = createOrderStepItems.find((item) =>
      stepFields[item.value].some((name) => name in errors)
    )
    if (badStep) {
      setStep(badStep.value)
      setFurthestStep("confirm")
    } else {
      toast.error("Dữ liệu đơn hàng không hợp lệ")
    }
  }

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
      onSubmit={form.handleSubmit((values) => create(values), onInvalid)}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs
        selectedKey={step}
        onSelectionChange={handleStepChange}
        className="gap-0"
      >
        <CreateOrderStepsTabs reachedStep={furthestStep} />

        <TabsContent id="info" className="m-0 outline-none">
          <CreateOrderInfoSection form={form} disabled={isPending} />
        </TabsContent>
        <TabsContent id="selectItems" className="m-0 outline-none">
          <CreateOrderSelectItemsStep form={form} />
        </TabsContent>
        <TabsContent id="itemQuantities" className="m-0 outline-none">
          <CreateOrderQuantitiesStep form={form} disabled={isPending} />
        </TabsContent>
        <TabsContent id="confirm" className="m-0 outline-none">
          <CreateOrderConfirmSection form={form} disabled={isPending} />
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
                to: "/manage/orders",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
        )}

        {nextStep ? (
          // key ép React unmount/remount thay vì tái dùng cùng node DOM khi đổi sang nhánh dưới —
          // phòng hờ cùng bug đã bắt được ở UpdateOrderForm.tsx (xem comment ở đó): goNext() là
          // async nên nếu tái dùng node giữa 1 cú click thật đang diễn ra, type có thể đổi
          // button→submit ngay lúc đó. Ở đây nhánh dưới bọc trong <div> (khác type với <Button>)
          // nên vốn đã không tái dùng node — key chỉ để không phụ thuộc vào việc bọc div đó còn
          // giữ nguyên mãi.
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
          <div
            key="submit-actions"
            className="flex flex-wrap items-center gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              isDisabled={isPending}
              onPress={() => {
                form.reset(createOrderFormDefaultValues)
                clearDraft()
                setStep("info")
                setFurthestStep("info")
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              isDisabled={isPending}
              onPress={() => {
                saveDraft(form.getValues())
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
            </Button>
            <Button
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
                  Tạo đơn hàng
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
