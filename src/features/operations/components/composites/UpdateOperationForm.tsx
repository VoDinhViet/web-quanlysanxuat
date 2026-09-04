import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { updateOperation } from "@/features/operations/api/server-functions/update-operation.api"
import { updateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import type { UpdateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import { operationStatusLabels } from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OperationDetail } from "@/lib/types/operation.type"

const operationStatusOptions = buildOptionsFromLabels(operationStatusLabels)

function getOperationDefaultValues(
  operation: OperationDetail
): UpdateOperationSchema {
  return {
    operationId: operation.id,
    code: operation.code,
    name: operation.name,
    note: operation.note ?? "",
    status: operation.status,
  }
}

type UpdateOperationFormProps = {
  operation: OperationDetail
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateOperationForm({
  operation,
  onSuccess,
  onCancel,
}: UpdateOperationFormProps) {
  const queryClient = useQueryClient()
  const updateOperationFn = useServerFn(updateOperation)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOperationSchema) =>
      updateOperationFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
      onSuccess()
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
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Chỉnh sửa công đoạn
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã, tên và trạng thái của công đoạn
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
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

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          isDisabled={isPending}
          onPress={onCancel}
        >
          Hủy
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
                  Lưu thay đổi
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
