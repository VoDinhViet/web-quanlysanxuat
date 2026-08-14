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
import { CreateQuotationItemsPickerSection } from "@/features/purchase-quotations/components/create/CreateQuotationItemsPickerSection"
import { CreateQuotationStepsTabs } from "@/features/purchase-quotations/components/create/CreateQuotationStepsTabs"
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

  // Draft key version bumped: the item shape changed (purchaseRequestItemId+quantity+
  // quantityAdjustmentReason at item level → itemId+allocations[] merging several dòng ĐXMH into
  // one item) to match the backend's gộp-by-itemId model — an old key would let
  // restoreFormDraft() write a stale-shaped draft into the form (it doesn't validate against the
  // current schema on restore), crashing step 2's `item.allocations.map`. Bumping the key lets
  // old drafts harmlessly expire.
  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateQuotationFormSchema>(
      "qlsx:draft:create-purchase-quotation-v3"
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
        <form.Subscribe selector={(state) => state.values.items.length}>
          {(itemCount) => (
            <CreateQuotationStepsTabs
              step={step}
              canGoToSuppliers={itemCount > 0}
              onStepChange={setStep}
            />
          )}
        </form.Subscribe>

        {step === "items" ? (
          <CreateQuotationItemsPickerSection form={form} disabled={isPending} />
        ) : (
          <CreateQuotationSuppliersSection form={form} disabled={isPending} />
        )}

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
