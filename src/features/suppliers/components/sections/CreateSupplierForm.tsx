import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateSupplierInfoSection } from "@/features/suppliers/components/sections/CreateSupplierInfoSection"
import { CreateSupplierOtherSection } from "@/features/suppliers/components/sections/CreateSupplierOtherSection"
import { CreateSupplierPaymentSection } from "@/features/suppliers/components/sections/CreateSupplierPaymentSection"
import {
  createSupplierFormDefaultValues,
  createSupplierSchema,
} from "@/features/suppliers/schemas/create-supplier.schema"
import { createSupplier } from "@/features/suppliers/api/server-functions/create-supplier.api"
import type { CreateSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"

export function CreateSupplierForm() {
  const navigate = useNavigate({ from: "/manage/suppliers/create/" })
  const queryClient = useQueryClient()
  const createSupplierFn = useServerFn(createSupplier)

  // v3: field `attachments` đổi tên thành `files` (attachments-to-files-registry rename) — bump
  // để nháp cũ (còn field `attachments`) không âm thầm làm rớt file đã đính kèm khi khôi phục.
  const { draft, saveDraft, clearDraft } = useFormDraft<CreateSupplierSchema>(
    "qlsx:draft:create-supplier-v3"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateSupplierSchema) =>
      createSupplierFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      await navigate({
        to: "/manage/suppliers",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createSupplierFormDefaultValues,
    validators: {
      onSubmit: createSupplierSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

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
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreateSupplierInfoSection form={form} disabled={isPending} />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <CreateSupplierPaymentSection form={form} disabled={isPending} />
          <CreateSupplierOtherSection form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            isDisabled={isPending}
            onPress={() =>
              void navigate({
                to: "/manage/suppliers",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              isDisabled={isPending}
              onPress={() => {
                form.reset()
                restoreFormDraft(form, createSupplierFormDefaultValues)
                clearDraft()
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
                      Lưu nhà cung cấp
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  )
}
