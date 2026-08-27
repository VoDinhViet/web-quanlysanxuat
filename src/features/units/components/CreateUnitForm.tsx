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

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateUnitSchema) => createUnitFn({ data: value }),
    onSuccess: async () => {
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
          Tên và phạm vi sử dụng của đơn vị tính — mã được cấp tự động
        </DialogDescription>
      </DialogHeader>

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

      <UnitScopesField form={form} disabled={isPending} />

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
                  Lưu đơn vị tính
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
