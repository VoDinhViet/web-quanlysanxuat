import { useEffect, useRef, useState } from "react"
import { useField } from "@tanstack/react-form"
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
import type { Key } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { getStepNav } from "@/lib/wizard-steps"
import { PurchaseRequestCreateHeaderSection } from "@/features/purchase-requests/components/sections/PurchaseRequestCreateHeaderSection"
import { PurchaseRequestCreateMaterialPickerSection } from "@/features/purchase-requests/components/sections/PurchaseRequestCreateMaterialPickerSection"
import { PurchaseRequestCreateQuantitySection } from "@/features/purchase-requests/components/sections/PurchaseRequestCreateQuantitySection"
import {
  PurchaseRequestCreateStepsTabs,
  purchaseRequestCreateStepItems,
} from "@/features/purchase-requests/components/sections/PurchaseRequestCreateStepsTabs"
import { PurchaseRequestCreateTallySheet } from "@/features/purchase-requests/components/sections/PurchaseRequestCreateTallySheet"
import { createPurchaseRequest } from "@/features/purchase-requests/api/server-functions/create-purchase-request.api"
import {
  createPurchaseRequestFormDefaultValues,
  createPurchaseRequestSchema,
} from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import type { PurchaseRequestCreateWizardStep } from "@/features/purchase-requests/components/sections/PurchaseRequestCreateStepsTabs"
import type { CreatePurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"

export function PurchaseRequestCreateForm() {
  const navigate = useNavigate({ from: "/manage/purchase-requests/create" })
  const queryClient = useQueryClient()
  const createPurchaseRequestFn = useServerFn(createPurchaseRequest)

  // -v2: the item shape changed (itemLabel → itemCode/itemName/itemUnit/minStock, for the
  // picker-table redesign) — a v1 key would let restoreFormDraft() write a stale-shaped draft
  // into the form (it doesn't validate against the current schema on restore), showing "—" for
  // every material's name. Renaming the key lets old drafts harmlessly expire, same idiom as
  // create-purchase-quotation-v2.
  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreatePurchaseRequestSchema>(
      "qlsx:draft:create-purchase-request-v3"
    )
  const draftRestoredRef = useRef(false)

  // Trả về void (giống createOrder/createInventoryReceipt) — backend không trả id nên điều hướng
  // về danh sách, không vào thẳng trang chi tiết vừa tạo.
  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreatePurchaseRequestSchema) =>
      createPurchaseRequestFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success("Đã tạo đề xuất mua hàng")
      await navigate({
        to: "/manage/purchase-requests",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createPurchaseRequestFormDefaultValues,
    validators: {
      onSubmit: createPurchaseRequestSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  const [step, setStep] = useState<PurchaseRequestCreateWizardStep>("materials")
  const canGoToQuantities =
    useField({ form, name: "items" }).state.value.length > 0

  // RAC's onSelectionChange returns a `Key` (string | number); `find` narrows it back
  // without a cast, and an unrecognised value simply doesn't switch steps.
  function handleStepChange(key: Key) {
    const nextStep = purchaseRequestCreateStepItems.find(
      (item) => item.value === String(key)
    )

    if (nextStep) {
      setStep(nextStep.value)
    }
  }

  // Auto-restore a saved draft into the form once, after localStorage hydrates. Always resumes
  // on step 1 (even if the draft already had vật tư picked) — the picker re-shows them
  // pre-checked, so resuming still asks the user to confirm the selection before step 2, same
  // gate a fresh form goes through.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    purchaseRequestCreateStepItems,
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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <Tabs
            selectedKey={step}
            onSelectionChange={handleStepChange}
            className="gap-0"
          >
            <PurchaseRequestCreateStepsTabs
              canGoToQuantities={canGoToQuantities}
            />

            <TabsContent id="materials" className="m-0 outline-none">
              <PurchaseRequestCreateMaterialPickerSection
                form={form}
                disabled={isPending}
              />
            </TabsContent>
            <TabsContent id="quantities" className="m-0 outline-none">
              <PurchaseRequestCreateHeaderSection
                form={form}
                disabled={isPending}
              />
              <div className="border-t border-border">
                <PurchaseRequestCreateQuantitySection
                  form={form}
                  disabled={isPending}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
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
                onPress={() =>
                  void navigate({
                    to: "/manage/purchase-requests",
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
                isDisabled={!canGoToQuantities}
                onPress={() => setStep(nextStep)}
              >
                {nextLabel}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  isDisabled={isPending}
                  onPress={() => {
                    form.reset()
                    restoreFormDraft(
                      form,
                      createPurchaseRequestFormDefaultValues
                    )
                    clearDraft()
                    setStep("materials")
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
                      isDisabled={!canSubmit || isSubmitting || isPending}
                    >
                      {isSubmitting || isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Đang lưu
                        </>
                      ) : (
                        <>
                          <Save />
                          Tạo đề xuất
                        </>
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            )}
          </div>
        </div>

        <div className="sticky top-6 h-fit rounded-lg bg-card p-4 shadow-card sm:p-5">
          <PurchaseRequestCreateTallySheet form={form} />
        </div>
      </div>
    </form>
  )
}
