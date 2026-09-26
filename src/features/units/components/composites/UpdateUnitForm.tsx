import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Diskette } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useAppForm } from "@/hooks/use-app-form"
import { UnitTypeSelect } from "@/features/units/components/primitives/UnitTypeSelect"
import { unitStatusLabels } from "@/lib/types/unit.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import { updateUnit } from "@/features/units/api/server-functions/update-unit.api"
import { updateUnitSchema } from "@/features/units/schemas/update-unit.schema"
import type { UpdateUnitSchema } from "@/features/units/schemas/update-unit.schema"
import type { UnitDetail } from "@/lib/types/unit.type"

function getUnitDefaultValues(unit: UnitDetail): UpdateUnitSchema {
  return {
    unitId: unit.id,
    code: unit.code,
    name: unit.name,
    type: unit.type,
    status: unit.status,
  }
}

const statusOptions = buildOptionsFromLabels(unitStatusLabels)

type UpdateUnitFormProps = {
  unit: UnitDetail
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

      <form.Field name="type">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && field.state.meta.errors.length > 0

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Loại đơn vị <span className="text-destructive">*</span>
              </FieldLabel>
              <UnitTypeSelect
                id={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                disabled={isPending}
                isInvalid={isInvalid}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )
        }}
      </form.Field>

      <form.AppField name="status">
        {(field) => (
          <field.RadioPillField
            label="Trạng thái"
            required
            options={statusOptions}
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
                  <Diskette />
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
