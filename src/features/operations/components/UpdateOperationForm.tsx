import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { updateOperation } from "@/features/operations/api/server-functions/update-operation.api"
import { updateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import type { UpdateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import {
  operationStatusLabels,
  operationTypeLabels,
} from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OperationDetail } from "@/lib/types/operation.type"

const operationTypeOptions = buildOptionsFromLabels(operationTypeLabels)
const operationStatusOptions = buildOptionsFromLabels(operationStatusLabels)

function getOperationDefaultValues(
  operation: OperationDetail
): UpdateOperationSchema {
  return {
    operationId: operation.id,
    code: operation.code,
    name: operation.name,
    type: operation.type,
    note: operation.note ?? "",
    status: operation.status,
  }
}

type UpdateOperationFormProps = {
  operation: OperationDetail
}

export function UpdateOperationForm({ operation }: UpdateOperationFormProps) {
  const navigate = useNavigate({
    from: "/manage/operations/$operationId/update",
  })
  const queryClient = useQueryClient()
  const updateOperationFn = useServerFn(updateOperation)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOperationSchema) =>
      updateOperationFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
      await navigate({ to: "/manage/operations" })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getOperationDefaultValues(operation),
    validators: {
      onSubmit: updateOperationSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
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
                placeholder="Nhập mã công đoạn"
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên công đoạn"
                required
                placeholder="Nhập tên công đoạn"
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

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => void navigate({ to: "/manage/operations" })}
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
                    <Save />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
