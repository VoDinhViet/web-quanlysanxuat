import { useEffect, useRef, useState } from "react"
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
import { CreateQuotationItemsPickerSection } from "@/features/purchase-quotations/components/create/CreateQuotationItemsPickerSection"
import { CreateQuotationSuppliersSection } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersSection"
import {
  submitQuotationToSuppliers,
  summarizeQuotationOutcomes,
} from "@/features/purchase-quotations/components/create/submit-quotation-to-suppliers"
import { createPurchaseQuotation } from "@/features/purchase-quotations/api/server-functions/create-purchase-quotation.api"
import {
  createQuotationFormDefaultValues,
  createQuotationFormSchema,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import type { CreateQuotationFormSchema } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const LIST_SEARCH = { page: 1, limit: 10 } as const

// Section 1 (chọn vật tư) must be confirmed before section 2 (khai báo NCC & báo giá) appears —
// not two routes, just a locally-gated reveal within the one form/page (no stepper precedent
// exists in this repo, see CreateOrderForm.tsx's stacked-sections idiom).
type WizardStep = "items" | "suppliers"

export function CreateQuotationForm() {
  const navigate = useNavigate({ from: "/manage/purchase-quotations/create" })
  const queryClient = useQueryClient()
  const createQuotationFn = useServerFn(createPurchaseQuotation)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateQuotationFormSchema>(
      "qlsx:draft:create-purchase-quotation"
    )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateQuotationFormSchema) =>
      submitQuotationToSuppliers(value, (data) => createQuotationFn({ data })),
    onSuccess: async (outcomes) => {
      const { succeededCount, failed } = summarizeQuotationOutcomes(outcomes)

      // Anything that succeeded is a real record now — invalidate/clear the draft regardless of
      // whether every supplier made it, so a retry doesn't recreate the ones that already exist.
      if (succeededCount > 0) {
        clearDraft()
        await queryClient.invalidateQueries({
          queryKey: ["purchase-quotations"],
        })
      }

      if (failed.length === 0) {
        toast.success(`Đã tạo ${succeededCount} báo giá`)
        await navigate({
          to: "/manage/purchase-quotations",
          search: LIST_SEARCH,
        })
        return
      }

      if (succeededCount > 0) {
        toast.warning(
          `Đã tạo ${succeededCount}/${outcomes.length} báo giá. Lỗi: ${failed
            .map((f) => `${f.supplierLabel} (${f.message})`)
            .join("; ")}`
        )
        await navigate({
          to: "/manage/purchase-quotations",
          search: LIST_SEARCH,
        })
        return
      }

      // Every supplier failed — stay on the form so the entered data isn't lost.
      toast.error(
        `Không tạo được báo giá nào. ${failed[0]?.message ?? ""}`.trim()
      )
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

  const [step, setStep] = useState<WizardStep>("items")

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
        {step === "items" ? (
          <CreateQuotationItemsPickerSection form={form} disabled={isPending} />
        ) : (
          <CreateQuotationSuppliersSection form={form} disabled={isPending} />
        )}
      </div>

      {step === "items" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              void navigate({
                to: "/manage/purchase-quotations",
                search: LIST_SEARCH,
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
                <ArrowRight className="size-4" />
              </Button>
            )}
          </form.Subscribe>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() => setStep("items")}
          >
            <ArrowLeft className="size-4" />
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
                      Đang tạo
                    </>
                  ) : (
                    <>
                      <Save />
                      Tạo RFQ
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      )}
    </form>
  )
}
