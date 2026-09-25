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
import { createDepartment } from "@/features/departments/api/server-functions/create-department.api"
import {
  createDepartmentFormDefaultValues,
  createDepartmentSchema,
} from "@/features/departments/schemas/create-department.schema"
import type { CreateDepartmentSchema } from "@/features/departments/schemas/create-department.schema"

type CreateDepartmentFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateDepartmentForm({
  onSuccess,
  onCancel,
}: CreateDepartmentFormProps) {
  const queryClient = useQueryClient()
  const createDepartmentFn = useServerFn(createDepartment)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateDepartmentSchema) =>
      createDepartmentFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createDepartmentFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createDepartmentSchema,
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
          Thêm phòng ban
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã và tên của phòng ban mới
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="code">
        {(field) => (
          <field.TextField
            label="Mã phòng ban"
            required
            placeholder="Vd. KT, SX, KHO"
            disabled={isPending}
          />
        )}
      </form.AppField>

      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Tên phòng ban"
            required
            placeholder="Vd. Phòng Kỹ thuật"
            disabled={isPending}
          />
        )}
      </form.AppField>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
        >
          Thoát
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
                  Lưu phòng ban
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
