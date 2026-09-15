import { useEffect, useRef, useState } from "react"
import { revalidateLogic, useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
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
import type { CreateOrderWizardStep } from "@/features/orders/components/sections/CreateOrderStepsTabs"
import type { CreateOrderSchema } from "@/features/orders/schemas/create-order.schema"

// Vỏ wizard "Tạo đơn hàng" — 3 bước (CreateOrderStepsTabs.tsx). TanStack Form thay
// react-hook-form (đã chuyển hết orders sang TanStack Form, không còn feature RHF thử nghiệm
// nào trong repo, xem forms-and-ui.md). Không có form.trigger() ở TanStack Form → chỉ 1 gate
// đơn giản (canGoToSelectItems) thay cho stepFields/onInvalid của bản RHF cũ.
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
    onSuccess: async (order) => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await navigate({
        to: "/manage/orders/$orderId",
        params: { orderId: order.id },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOrderFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createOrderSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  // `restoreFormDraft` (setFieldValue per key) refreshes already-mounted field inputs, unlike
  // `form.reset(values)` in this TanStack Form version.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  const [step, setStep] = useState<CreateOrderWizardStep>("info")

  const clientId = useField({ form, name: "clientId" }).state.value
  const orderDate = useField({ form, name: "orderDate" }).state.value
  const dueDate = useField({ form, name: "dueDate" }).state.value
  const exchangeRate = useField({ form, name: "exchangeRate" }).state.value
  const canGoToSelectItems =
    Boolean(clientId) &&
    Boolean(orderDate) &&
    Boolean(dueDate) &&
    exchangeRate !== undefined

  // base-ui's Tabs.Root types onValueChange's value as `any | null` (TabsTabValue) — mọi
  // TabsTrigger value ở đây đều là string, nên chỉ cần khớp trực tiếp, không phải parse/ép kiểu.
  // Tab đã bị khoá bởi `canGoToSelectItems` ở CreateOrderStepsTabs nên không cần tự validate
  // lại ở đây.
  function handleStepChange(value: string | null) {
    const nextStep = createOrderStepItems.find((item) => item.value === value)
    if (nextStep) setStep(nextStep.value)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createOrderStepItems,
    step
  )

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="overflow-hidden rounded-lg bg-card shadow-card"
    >
      <Tabs value={step} onValueChange={handleStepChange} className="gap-0">
        <CreateOrderStepsTabs canGoToSelectItems={canGoToSelectItems} />

        <TabsContent value="info" className="m-0 outline-none">
          <CreateOrderInfoSection form={form} disabled={isPending} />
        </TabsContent>
        <TabsContent value="selectItems" className="m-0 outline-none">
          <CreateOrderSelectItemsStep form={form} />
        </TabsContent>
        <TabsContent value="confirm" className="m-0 outline-none">
          <CreateOrderQuantitiesStep form={form} disabled={isPending} />
          <div className="border-t border-border">
            <CreateOrderConfirmSection form={form} disabled={isPending} />
          </div>
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
                to: "/manage/orders",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
        )}

        {nextStep ? (
          <Button
            type="button"
            disabled={isPending || (step === "info" && !canGoToSelectItems)}
            onClick={() => setStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, createOrderFormDefaultValues)
                clearDraft()
                setStep("info")
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                saveDraft(form.state.values)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
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
                      Tạo đơn hàng
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </div>
    </form>
  )
}
