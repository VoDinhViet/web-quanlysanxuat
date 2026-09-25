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
import { updateUnit } from "@/features/units/api/server-functions/update-unit.api"
import { updateUnitSchema } from "@/features/units/schemas/update-unit.schema"
import type { UpdateUnitSchema } from "@/features/units/schemas/update-unit.schema"
import type { Unit } from "@/lib/types/unit.type"

function getUnitDefaultValues(unit: Unit): UpdateUnitSchema {
  return {
    unitId: unit.id,
    code: unit.code,
    name: unit.name,
  }
}

type UpdateUnitFormProps = {
  unit: Unit
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateUnitForm({
  unit,
  onSuccess,
  onCancel,
}: UpdateUnitFormProps) {
  const queryClient = useQueryClient()
  const updateUnitFn = useServerFn(updateUnit)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateUnitSchema) => updateUnitFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["units"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getUnitDefaultValues(unit),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateUnitSchema,
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
          Chỉnh sửa đơn vị tính
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Mã và tên của đơn vị tính
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Mã đơn vị tính"
              required
              placeholder="Nhập mã đơn vị tính"
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Tên đơn vị tính"
              required
              placeholder="Nhập tên đơn vị tính"
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
