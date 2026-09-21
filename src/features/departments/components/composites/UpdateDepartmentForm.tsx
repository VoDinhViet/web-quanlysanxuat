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
import { updateDepartment } from "@/features/departments/api/server-functions/update-department.api"
import { updateDepartmentSchema } from "@/features/departments/schemas/update-department.schema"
import type { UpdateDepartmentSchema } from "@/features/departments/schemas/update-department.schema"
import type { Department } from "@/lib/types/department.type"

function getDepartmentDefaultValues(
  department: Department
): UpdateDepartmentSchema {
  return {
    departmentId: department.id,
    code: department.code,
    name: department.name,
    isActive: department.isActive ?? true,
  }
}

type UpdateDepartmentFormProps = {
  department: Department
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateDepartmentForm({
  department,
  onSuccess,
  onCancel,
}: UpdateDepartmentFormProps) {
  const queryClient = useQueryClient()
  const updateDepartmentFn = useServerFn(updateDepartment)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateDepartmentSchema) =>
      updateDepartmentFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getDepartmentDefaultValues(department),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateDepartmentSchema,
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
          Chỉnh sửa phòng ban
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã và tên của phòng ban
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

      <form.AppField name="isActive">
        {(field) => (
          <field.SwitchField
            label="Trạng thái"
            onLabel="Đang hoạt động"
            offLabel="Ngừng hoạt động"
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
      </DialogFooter>
    </form>
  )
}
