import { Activity, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateMaterialExtendedSection } from "@/features/materials/components/CreateMaterialExtendedSection"
import { CreateMaterialInfoSection } from "@/features/materials/components/CreateMaterialInfoSection"
import {
  CREATE_MATERIAL_DEFAULT_VALUES,
  createMaterialSchema,
} from "@/features/materials/schemas/create-material.schema"
import { createMaterial } from "@/features/materials/server-functions/create-material"
import type { CreateMaterialSchema } from "@/features/materials/schemas/create-material.schema"
import type { MaterialRef } from "@/features/materials/types/material.type"

type CreateMaterialFormProps = {
  unitOptions: MaterialRef[]
  materialGroupOptions: MaterialRef[]
  supplierOptions: MaterialRef[]
}

export function CreateMaterialForm({
  unitOptions,
  materialGroupOptions,
  supplierOptions,
}: CreateMaterialFormProps) {
  const navigate = useNavigate({ from: "/manage/materials/create" })
  const queryClient = useQueryClient()
  const createMaterialFn = useServerFn(createMaterial)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateMaterialSchema>(
    "qlsx:draft:create-material"
  )
  const draftRestoredRef = useRef(false)

  const createMaterialMutation = useMutation({
    mutationFn: (value: CreateMaterialSchema) =>
      createMaterialFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["materials"] })
      await navigate({
        to: "/manage/materials",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const isPending = createMaterialMutation.isPending
  const error = createMaterialMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_MATERIAL_DEFAULT_VALUES,
    validators: {
      onSubmit: createMaterialSchema,
    },
    onSubmit: ({ value }) => createMaterialMutation.mutate(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
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
      <Activity mode={error ? "visible" : "hidden"}>
        <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertOctagon className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CreateMaterialInfoSection
          form={form}
          disabled={isPending}
          unitOptions={unitOptions}
          materialGroupOptions={materialGroupOptions}
          selectedClient={undefined}
        />

        <div className="border-t border-border">
          <CreateMaterialExtendedSection
            form={form}
            disabled={isPending}
            supplierOptions={supplierOptions}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/materials",
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
                restoreFormDraft(form, CREATE_MATERIAL_DEFAULT_VALUES)
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
