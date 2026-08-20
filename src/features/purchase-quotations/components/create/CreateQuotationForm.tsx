import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AltArrowLeft,
  AltArrowRight,
  Diskette,
  FileText,
  Restart,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateQuotationItemsPickerSection } from "@/features/purchase-quotations/components/create/CreateQuotationItemsPickerSection"
import {
  CreateQuotationStepsTabs,
  createQuotationStepItems,
} from "@/features/purchase-quotations/components/create/CreateQuotationStepsTabs"
import { CreateQuotationSuppliersSection } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersSection"
import { createPurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/create-purchase-quotation.api"
import {
  createQuotationFormDefaultValues,
  createQuotationFormSchema,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import type { CreateQuotationWizardStep } from "@/features/purchase-quotations/components/create/CreateQuotationStepsTabs"
import type { CreateQuotationFormSchema } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

export function CreateQuotationForm() {
  const navigate = useNavigate({ from: "/manage/purchase-quotations/create" })
  const queryClient = useQueryClient()
  const createQuotationFn = useServerFn(createPurchaseQuotation)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateQuotationFormSchema>(
      "qlsx:draft:create-purchase-quotation-v4"
    )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateQuotationFormSchema) =>
      createQuotationFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({
        queryKey: ["purchase-quotations"],
      })
      toast.success("Đã tạo RFQ")
      await navigate({
        to: "/manage/purchase-quotations",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createQuotationFormDefaultValues,
    validators: {
      onSubmit: createQuotationFormSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  const [step, setStep] = useState<CreateQuotationWizardStep>("items")

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't switch steps.
  function handleStepChange(value: string) {
    const nextStep = createQuotationStepItems.find(
      (item) => item.value === value
    )

    if (nextStep) {
      setStep(nextStep.value)
    }
  }

  // Auto-restore a saved draft into the form once, after localStorage hydrates. Always resumes on
  // step 1 (even if the draft already had items picked) — the picker re-shows them pre-checked,
  // so resuming still asks the user to confirm the selection before step 2, same gate a fresh
  // form goes through.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

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

        {step === "items" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                void navigate({
                  to: "/manage/purchase-quotations",
                  search: { page: 1, limit: 10 },
                })
              }
            >
              Hủy
            </Button>
            <form.Subscribe selector={(state) => state.values.items.length}>
              {(itemCount) => (
                <Button
                  type="button"
                  disabled={itemCount === 0}
                  onClick={() => setStep("suppliers")}
                >
                  Tiếp theo: Khai báo NCC & báo giá
                  <AltArrowRight className="size-4" />
                </Button>
              )}
            </form.Subscribe>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => setStep("items")}
            >
              <AltArrowLeft className="size-4" />
              Quay lại chọn vật tư
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => {
                  form.reset()
                  restoreFormDraft(form, createQuotationFormDefaultValues)
                  clearDraft()
                  setStep("items")
                }}
              >
                <Restart className="size-4" />
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
                        Đang tạo
                      </>
                    ) : (
                      <>
                        <Diskette />
                        Tạo RFQ
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
