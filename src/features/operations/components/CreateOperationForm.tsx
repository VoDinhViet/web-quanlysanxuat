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
import { createOperation } from "@/features/operations/api/server-functions/create-operation.api"
import {
  createOperationFormDefaultValues,
  createOperationSchema,
} from "@/features/operations/schemas/create-operation.schema"
import type { CreateOperationSchema } from "@/features/operations/schemas/create-operation.schema"
import { operationStatusLabels } from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const operationStatusOptions = buildOptionsFromLabels(operationStatusLabels)

type CreateOperationFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateOperationForm({
  onSuccess,
  onCancel,
}: CreateOperationFormProps) {
  const queryClient = useQueryClient()
  const createOperationFn = useServerFn(createOperation)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateOperationSchema) =>
      createOperationFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
      onSuccess()
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
          Tạo công đoạn
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Tên và trạng thái của công đoạn — mã được cấp tự động
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
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
          disabled={isPending}
          onClick={onCancel}
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
                  Lưu công đoạn
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
