import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateConsumableExtendedSection } from "@/features/consumables/components/sections/CreateConsumableExtendedSection"
import { CreateConsumableInfoSection } from "@/features/consumables/components/sections/CreateConsumableInfoSection"
import {
  createConsumableFormDefaultValues,
  createConsumableSchema,
} from "@/features/consumables/schemas/create-consumable.schema"
import { createConsumable } from "@/features/consumables/api/server-functions/create-consumable.api"
import type { CreateConsumableSchema } from "@/features/consumables/schemas/create-consumable.schema"

export function CreateConsumableForm() {
  const navigate = useNavigate({ from: "/manage/consumables/create/" })
  const queryClient = useQueryClient()
  const createConsumableFn = useServerFn(createConsumable)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateConsumableSchema>(
    "qlsx:draft:create-consumable-v2"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateConsumableSchema) =>
      createConsumableFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["consumables"] })
      await navigate({
        to: "/manage/consumables",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createConsumableFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createConsumableSchema,
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
        <CreateConsumableInfoSection
          form={form}
          disabled={isPending}
          selectedClient={undefined}
        />

        <CreateConsumableExtendedSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/consumables",
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
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, createConsumableFormDefaultValues)
                clearDraft()
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
                      Lưu vật tư
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
