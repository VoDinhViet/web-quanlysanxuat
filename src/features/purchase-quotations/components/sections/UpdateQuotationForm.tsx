import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AltArrowLeft,
  AltArrowRight,
  Diskette,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Key } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateQuotationItemsPickerSection } from "@/features/purchase-quotations/components/sections/CreateQuotationItemsPickerSection"
import {
  CreateQuotationStepsTabs,
  createQuotationStepItems,
} from "@/features/purchase-quotations/components/sections/CreateQuotationStepsTabs"
import { CreateQuotationSuppliersSection } from "@/features/purchase-quotations/components/sections/CreateQuotationSuppliersSection"
import { updatePurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/update-purchase-quotation.api"
import {
  createQuotationFormSchema,
  mapQuotationDetailToFormValues,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { getStepNav } from "@/lib/wizard-steps"
import type { CreateQuotationWizardStep } from "@/features/purchase-quotations/components/sections/CreateQuotationStepsTabs"
import type { CreateQuotationFormSchema } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type UpdateQuotationFormProps = {
  purchaseQuotation: PurchaseQuotationDetail
}

export function UpdateQuotationForm({
  purchaseQuotation,
}: UpdateQuotationFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateQuotationFn = useServerFn(updatePurchaseQuotation)

  const defaultValues = useMemo(
    () => mapQuotationDetailToFormValues(purchaseQuotation),
    [purchaseQuotation]
  )

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: CreateQuotationFormSchema) =>
      updateQuotationFn({
        data: {
          purchaseQuotationId: purchaseQuotation.id,
          items: value.items,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchase-quotations"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["purchase-quotations", purchaseQuotation.id],
        }),
      ])
      toast.success("Đã cập nhật RFQ")
      await navigate({
        to: "/manage/purchase-quotations/$purchaseQuotationId",
        params: { purchaseQuotationId: purchaseQuotation.id },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createQuotationFormSchema,
    },
    onSubmit: ({ value }) => update(value),
    onSubmitInvalid: () =>
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập trước khi lưu RFQ."),
  })

  // Start directly on suppliers step since items are already picked
  const [step, setStep] = useState<CreateQuotationWizardStep>("suppliers")

  function handleStepChange(key: Key) {
    const nextStep = createQuotationStepItems.find(
      (item) => item.value === String(key)
    )

    if (nextStep) {
      setStep(nextStep.value)
    }
  }

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createQuotationStepItems,
    step
  )

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  const handleCancel = () => {
    void navigate({
      to: "/manage/purchase-quotations/$purchaseQuotationId",
      params: { purchaseQuotationId: purchaseQuotation.id },
    })
  }

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
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <Tabs value={step} onValueChange={handleStepChange} className="gap-0">
          <form.Subscribe selector={(state) => state.values.items.length}>
            {(itemCount) => (
              <CreateQuotationStepsTabs canGoToSuppliers={itemCount > 0} />
            )}
          </form.Subscribe>

          <TabsContent value="items" className="m-0 outline-none">
            <CreateQuotationItemsPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="suppliers" className="m-0 outline-none">
            <CreateQuotationSuppliersSection form={form} disabled={isPending} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          {prevStep ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => setStep(prevStep)}
            >
              <AltArrowLeft className="size-4" />
              {prevLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          )}

          {nextStep ? (
            <form.Subscribe selector={(state) => state.values.items.length}>
              {(itemCount) => (
                <Button
                  type="button"
                  disabled={itemCount === 0}
                  onClick={() => setStep(nextStep)}
                >
                  {nextLabel}
                  <AltArrowRight className="size-4" />
                </Button>
              )}
            </form.Subscribe>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleCancel}
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
                        <Diskette />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
