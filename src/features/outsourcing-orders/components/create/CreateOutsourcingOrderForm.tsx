import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CreateOutsourcingOrderConfirmSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderConfirmSection"
import { CreateOutsourcingOrderInfoSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderInfoSection"
import { CreateOutsourcingOrderItemsSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderItemsSection"
import { CreateOutsourcingOrderPickerSection } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderPickerSection"
import { CreateOutsourcingOrderStepsTabs } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderStepsTabs"
import { CreateOutsourcingOrderSuccessDialog } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderSuccessDialog"
import { createMockOutsourcingOrder } from "@/features/outsourcing-orders/mock/create-outsourcing-order.mock"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/outsourcing-order-item-totals"
import {
  createOutsourcingOrderFormDefaultValues,
  createOutsourcingOrderSchema,
} from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import type { CreateOutsourcingOrderWizardStep } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderStepsTabs"
import type { CreateOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

type StepNavMeta = {
  prevStep?: CreateOutsourcingOrderWizardStep
  prevLabel?: string
  nextStep?: CreateOutsourcingOrderWizardStep
  nextLabel?: string
}

const stepNav: Record<CreateOutsourcingOrderWizardStep, StepNavMeta> = {
  picker: { nextStep: "items", nextLabel: "Tiếp theo: Nhập SL & thông tin" },
  items: {
    prevStep: "picker",
    prevLabel: "Quay lại chọn chi tiết",
    nextStep: "confirm",
    nextLabel: "Tiếp theo: Xác nhận",
  },
  confirm: { prevStep: "items", prevLabel: "Quay lại nhập SL & thông tin" },
}

// Vỏ wizard "Tạo phiếu OS-OUT" — rập khuôn InventoryReceiptCreateFromPoForm.tsx/
// PurchaseRequestCreateForm.tsx, 3 bước, không có "Lưu nháp" riêng (chỉ 1 hành động submit —
// backend đích chưa tồn tại nên không có khái niệm DRAFT thật).
export function CreateOutsourcingOrderForm() {
  const navigate = useNavigate({ from: "/manage/outsourcing-orders/create" })
  const queryClient = useQueryClient()
  const { data: suppliers = [] } = useQuery(supplierOptionsQueryOptions())

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateOutsourcingOrderSchema>(
      "qlsx:draft:create-outsourcing-order-v1"
    )
  const draftRestoredRef = useRef(false)

  const [step, setStep] = useState<CreateOutsourcingOrderWizardStep>("picker")
  const [createdCode, setCreatedCode] = useState<string | null>(null)

  const { mutate: create, isPending } = useMutation({
    mutationFn: async (value: CreateOutsourcingOrderSchema) => {
      const selectedSupplier = suppliers.find((s) => s.id === value.supplierId)
      if (!selectedSupplier) {
        throw new Error("Vui lòng chọn nhà cung cấp gia công.")
      }

      const { code } = await createMockOutsourcingOrder({
        ...value,
        supplierName: selectedSupplier.name,
      })

      setCreatedCode(code)
    },
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] })
      toast.success("Đã tạo phiếu xuất đi gia công (OS-OUT)")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOutsourcingOrderFormDefaultValues,
    validators: {
      onSubmit: createOutsourcingOrderSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  const items = useField({ form, name: "items" }).state.value

  function handleStepChange(nextStep: CreateOutsourcingOrderWizardStep) {
    setStep(nextStep)
    saveDraft(form.state.values)
  }

  function resetWizard() {
    form.reset()
    restoreFormDraft(form, createOutsourcingOrderFormDefaultValues)
    clearDraft()
    setStep("picker")
    setCreatedCode(null)
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = stepNav[step]

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
      >
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <form.Subscribe
            selector={(state) => ({
              hasItems: state.values.items.length > 0,
              hasStepTwoInfo: Boolean(
                state.values.supplierId &&
                state.values.sendDate &&
                state.values.expectedReturnDate
              ),
            })}
          >
            {({ hasItems, hasStepTwoInfo }) => (
              <CreateOutsourcingOrderStepsTabs
                step={step}
                canGoToItems={hasItems}
                canGoToConfirm={hasItems && hasStepTwoInfo}
                onStepChange={handleStepChange}
              />
            )}
          </form.Subscribe>

          {step === "picker" && (
            <CreateOutsourcingOrderPickerSection
              form={form}
              disabled={isPending}
            />
          )}
          {step === "items" && (
            <>
              <CreateOutsourcingOrderInfoSection
                form={form}
                disabled={isPending}
              />
              <div className="border-t border-border">
                <CreateOutsourcingOrderItemsSection
                  form={form}
                  disabled={isPending}
                />
              </div>
            </>
          )}
          {step === "confirm" && (
            <CreateOutsourcingOrderConfirmSection form={form} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            {prevStep ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                disabled={isPending}
                onClick={() => handleStepChange(prevStep)}
              >
                <AltArrowLeft className="size-4" />
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
                    to: "/manage/outsourcing-orders",
                    search: { page: 1, limit: 10 },
                  })
                }
              >
                Hủy
              </Button>
            )}

            {nextStep ? (
              <form.Subscribe
                selector={(state) => ({
                  hasItems: state.values.items.length > 0,
                  hasStepTwoInfo: Boolean(
                    state.values.supplierId &&
                    state.values.sendDate &&
                    state.values.expectedReturnDate
                  ),
                })}
              >
                {({ hasItems, hasStepTwoInfo }) => {
                  const canAdvance =
                    step === "picker" ? hasItems : hasItems && hasStepTwoInfo

                  return (
                    <Button
                      type="button"
                      disabled={!canAdvance}
                      onClick={() => handleStepChange(nextStep)}
                    >
                      {nextLabel}
                      <AltArrowRight className="size-4" />
                    </Button>
                  )
                }}
              </form.Subscribe>
            ) : (
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button
                    type="button"
                    disabled={!canSubmit || isSubmitting || isPending}
                    onClick={() => form.handleSubmit()}
                  >
                    {isSubmitting || isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Đang tạo phiếu
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4" />
                        Xác nhận tạo phiếu
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
          </div>
        </div>
      </form>

      {createdCode && (
        <CreateOutsourcingOrderSuccessDialog
          open
          code={createdCode}
          {...sumOutsourcingOrderItemTotals(items)}
          onBackToList={() =>
            void navigate({
              to: "/manage/outsourcing-orders",
              search: { page: 1, limit: 10 },
            })
          }
          onCreateAnother={resetWizard}
        />
      )}
    </>
  )
}
