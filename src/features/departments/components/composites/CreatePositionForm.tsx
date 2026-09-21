import { revalidateLogic } from "@tanstack/react-form"
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
import { createPosition } from "@/features/departments/api/server-functions/create-position.api"
import {
  createPositionFormDefaultValues,
  createPositionSchema,
} from "@/features/departments/schemas/create-position.schema"
import type { CreatePositionSchema } from "@/features/departments/schemas/create-position.schema"

type CreatePositionFormProps = {
  departmentId: string
  onSuccess: () => void
  onCancel: () => void
}

export function CreatePositionForm({
  departmentId,
  onSuccess,
  onCancel,
}: CreatePositionFormProps) {
  const queryClient = useQueryClient()
  const createPositionFn = useServerFn(createPosition)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreatePositionSchema) =>
      createPositionFn({ data: value }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
        queryClient.invalidateQueries({ queryKey: ["positions"] }),
      ])
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createPositionFormDefaultValues(departmentId),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createPositionSchema,
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
          Thêm chức vụ
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã và tên của chức vụ mới trong phòng ban này
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Mã chức vụ"
              required
              placeholder="Nhập mã chức vụ"
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Tên chức vụ"
              required
              placeholder="Nhập tên chức vụ"
              disabled={isPending}
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
                  Lưu chức vụ
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
