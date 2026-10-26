import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic, useSelector } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Key } from "react-aria-components"

import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { createStandaloneOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/create-standalone-outsourcing-order.api"
import { updateStandaloneOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/update-standalone-outsourcing-order.api"
import { StandaloneOutsourcingOrderInfoSection } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderInfoSection"
import { StandaloneOutsourcingOrderConfirmSection } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderConfirmSection"
import { StandaloneOutsourcingOrderItemsSection } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderItemsSection"
import {
  StandaloneOutsourcingOrderStepsTabs,
  standaloneOutsourcingOrderStepItems,
} from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderStepsTabs"
import type { StandaloneOutsourcingOrderWizardStep } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderStepsTabs"
import {
  standaloneOutsourcingOrderFormDefaultValues,
  standaloneOutsourcingOrderItemSchema,
  standaloneOutsourcingOrderSchema,
} from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import type { StandaloneOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { getStepNav } from "@/lib/wizard-steps"

// Field của bước ①: lỗi ở các field này thì quay về bước ①, còn lại là lỗi dòng hàng ở bước ②.
const infoFieldNames = [
  "supplierId",
  "operationId",
  "sendDate",
  "expectedReturnDate",
  "note",
] as const

// Bước ② cần đủ thông tin phiếu, bước ③ cần thêm mọi dòng hợp lệ. Trùng mã hàng, ngày nhận trước
// ngày gửi thì để lúc lưu bắt.
function canEnterStep(
  step: StandaloneOutsourcingOrderWizardStep,
  values: StandaloneOutsourcingOrderSchema
) {
  const hasInfo = Boolean(
    values.supplierId && values.operationId && values.sendDate
  )
  if (step === "info") return true
  if (step === "items") return hasInfo
  return (
    hasInfo &&
    values.items.every(
      (item) => standaloneOutsourcingOrderItemSchema.safeParse(item).success
    )
  )
}

type StandaloneOutsourcingOrderFormProps = {
  // Có `editing` thì lưu bằng PATCH và quay về chi tiết phiếu, không thì tạo nháp mới.
  editing?: {
    outsourcingOrderId: string
    defaultValues: StandaloneOutsourcingOrderSchema
    supplierOption: ComboboxOption
    operationOption: ComboboxOption
  }
}

// Phiếu thủ công theo 3 bước: thông tin phiếu → hàng gửi → xác nhận. Lưu luôn ở trạng thái Nháp,
// gửi duyệt ở trang chi tiết.
export function StandaloneOutsourcingOrderForm({
  editing,
}: StandaloneOutsourcingOrderFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createOrderFn = useServerFn(createStandaloneOutsourcingOrder)
  const updateOrderFn = useServerFn(updateStandaloneOutsourcingOrder)

  const leaveForm = () =>
    editing
      ? navigate({
          to: "/manage/outsourcing-orders/$outsourcingOrderId",
          params: { outsourcingOrderId: editing.outsourcingOrderId },
        })
      : navigate({
          to: "/manage/outsourcing-orders",
          search: { page: 1, limit: 10 },
        })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (value: StandaloneOutsourcingOrderSchema) =>
      editing
        ? updateOrderFn({
            data: {
              outsourcingOrderId: editing.outsourcingOrderId,
              order: value,
            },
          })
        : createOrderFn({ data: value }),
    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] })
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      toast.success(
        editing
          ? "Đã lưu phiếu gia công ngoài"
          : "Đã lưu nháp phiếu gia công ngoài thủ công, cần gửi duyệt"
      )
      await leaveForm()
    },
    onError: (error) => toast.error(error.message),
  })

  const [step, setStep] = useState<StandaloneOutsourcingOrderWizardStep>("info")

  const form = useAppForm({
    defaultValues: editing
      ? editing.defaultValues
      : standaloneOutsourcingOrderFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: standaloneOutsourcingOrderSchema },
    onSubmit: ({ value }) => save(value),
    // Lỗi chỉ bắt lúc lưu (ngày nhận trước ngày gửi, trùng mã hàng) nằm ở bước khác: đưa người dùng
    // về đúng bước đó thay vì để lỗi khuất sau tab.
    onSubmitInvalid: ({ formApi }) => {
      const hasInfoError = infoFieldNames.some(
        (fieldName) => (formApi.getFieldMeta(fieldName)?.errors.length ?? 0) > 0
      )
      setStep(hasInfoError ? "info" : "items")
    },
  })

  const values = useSelector(form.store, (state) => state.values)

  function handleStepChange(key: Key) {
    const targetStep = standaloneOutsourcingOrderStepItems.find(
      (stepItem) => stepItem.value === String(key)
    )
    if (targetStep) setStep(targetStep.value)
  }

  // Ô trong bảng chỉ ghi vào form khi blur, nên kiểm trên giá trị mới nhất lúc bấm thay vì khoá
  // nút theo giá trị đã render (bấm thẳng từ ô đang gõ sẽ bị nuốt mất lần đầu).
  function goToNextStep(targetStep: StandaloneOutsourcingOrderWizardStep) {
    if (!canEnterStep(targetStep, form.state.values)) {
      toast.error(
        "Vui lòng điền đủ các ô bắt buộc (*) trước khi sang bước tiếp."
      )
      return
    }
    setStep(targetStep)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    standaloneOutsourcingOrderStepItems,
    step
  )

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      // Chỉ tự focus ô đầu ở màn tạo mới, màn sửa giữ nguyên như cũ.
      ref={editing ? undefined : formRef}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        void form.handleSubmit()
      }}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      {/* Giữ cả 3 panel trong DOM: unmount làm ô NCC/công đoạn mất nhãn đã chọn, và field không được
          mount lúc bấm lưu thì không được đánh dấu touched nên lỗi của nó không hiện. */}
      <Tabs value={step} onValueChange={handleStepChange} className="gap-0">
        <StandaloneOutsourcingOrderStepsTabs
          canGoToItems={canEnterStep("items", values)}
          canGoToConfirm={canEnterStep("confirm", values)}
        />

        <TabsContent value="info" keepMounted className="m-0 outline-none">
          <StandaloneOutsourcingOrderInfoSection
            form={form}
            disabled={isPending}
            initialSupplierOption={editing?.supplierOption}
            initialOperationOption={editing?.operationOption}
          />
        </TabsContent>
        <TabsContent value="items" keepMounted className="m-0 outline-none">
          <StandaloneOutsourcingOrderItemsSection
            form={form}
            disabled={isPending}
          />
        </TabsContent>
        <TabsContent value="confirm" keepMounted className="m-0 outline-none">
          <StandaloneOutsourcingOrderConfirmSection form={form} />
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
            onClick={() => void leaveForm()}
          >
            Thoát
          </Button>
        )}

        {nextStep ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => goToNextStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          // Không khoá theo `canSubmit`: bấm lại khi còn lỗi để `onSubmitInvalid` đưa về đúng bước.
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting || isPending}>
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu…
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    {editing ? "Lưu thay đổi" : "Lưu nháp phiếu"}
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
