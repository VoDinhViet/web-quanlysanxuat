import { useEffect, useRef } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { UnitScopesField } from "@/features/units/components/UnitScopesField"
import { createUnit } from "@/features/units/api/server-functions/create-unit.api"
import {
  createUnitFormDefaultValues,
  createUnitSchema,
} from "@/features/units/schemas/create-unit.schema"
import type { CreateUnitSchema } from "@/features/units/schemas/create-unit.schema"

type CreateUnitFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateUnitForm({ onSuccess, onCancel }: CreateUnitFormProps) {
  const queryClient = useQueryClient()
  const createUnitFn = useServerFn(createUnit)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateUnitSchema>(
    "qlsx:draft:create-unit"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateUnitSchema) => createUnitFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["units"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createUnitFormDefaultValues,
    validators: {
      onSubmit: createUnitSchema,
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Thêm đơn vị tính
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã, tên và phạm vi sử dụng của đơn vị tính
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Mã đơn vị tính"
              required
              placeholder="Nhập mã đơn vị tính, vd. THUNG"
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Tên đơn vị tính"
              required
              placeholder="Nhập tên đơn vị tính, vd. Thùng"
              disabled={isPending}
            />
          )}
        </form.AppField>
      </div>

      <UnitScopesField form={form} disabled={isPending} />

      <DialogFooter className="flex-wrap items-center gap-2 sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          disabled={isPending}
          onClick={onCancel}
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
              restoreFormDraft(form, createUnitFormDefaultValues)
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
                    Lưu đơn vị tính
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </DialogFooter>
    </form>
  )
}
