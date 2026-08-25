import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { createOperation } from "@/features/operations/api/server-functions/create-operation.api"
import {
  createOperationFormDefaultValues,
  createOperationSchema,
} from "@/features/operations/schemas/create-operation.schema"
import type { CreateOperationSchema } from "@/features/operations/schemas/create-operation.schema"
import {
  operationStatusLabels,
  operationTypeLabels,
} from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const operationTypeOptions = buildOptionsFromLabels(operationTypeLabels)
const operationStatusOptions = buildOptionsFromLabels(operationStatusLabels)

export function CreateOperationForm() {
  const navigate = useNavigate({ from: "/manage/operations/create" })
  const queryClient = useQueryClient()
  const createOperationFn = useServerFn(createOperation)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateOperationSchema>(
    "qlsx:draft:create-operation"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateOperationSchema) =>
      createOperationFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
      await navigate({ to: "/manage/operations" })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOperationFormDefaultValues,
    validators: {
      onSubmit: createOperationSchema,
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
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin chung
          </h2>
          <p className="text-sm text-muted-foreground">
            Mã, tên, hình thức thực hiện và trạng thái của công đoạn
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                label="Mã công đoạn"
                required
                placeholder="Nhập mã công đoạn, vd. CD01"
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên công đoạn"
                required
                placeholder="Nhập tên công đoạn, vd. Cắt laser"
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="type">
            {(field) => (
              <field.SelectField
                label="Hình thức"
                required
                placeholder="Chọn hình thức"
                options={operationTypeOptions}
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="status">
            {(field) => (
              <field.SelectField
                label="Trạng thái"
                required
                placeholder="Chọn trạng thái"
                options={operationStatusOptions}
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Nhập ghi chú (nếu có)"
                disabled={isPending}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() => void navigate({ to: "/manage/operations" })}
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
                restoreFormDraft(form, createOperationFormDefaultValues)
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
                      Lưu công đoạn
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
