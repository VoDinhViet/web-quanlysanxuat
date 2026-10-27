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
import { useAppForm } from "@/hooks/use-app-form"
import { createItemCategory } from "@/features/item-categories/api/server-functions/create-item-category.api"
import {
  createItemCategoryFormDefaultValues,
  createItemCategorySchema,
} from "@/features/item-categories/schemas/create-item-category.schema"
import type { CreateItemCategorySchema } from "@/features/item-categories/schemas/create-item-category.schema"

type CreateItemCategoryFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateItemCategoryForm({
  onSuccess,
  onCancel,
}: CreateItemCategoryFormProps) {
  const queryClient = useQueryClient()
  const createItemCategoryFn = useServerFn(createItemCategory)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateItemCategorySchema) =>
      createItemCategoryFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["item-categories"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createItemCategoryFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createItemCategorySchema,
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
        <DialogTitle className="text-base font-medium">
          Thêm nhóm vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Nhóm vật tư dùng để phân loại và thống kê vật tư
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="code">
        {(field) => (
          <field.TextField
            label="Mã nhóm vật tư"
            required
            placeholder="Nhập mã nhóm, vd. BULONG"
            disabled={isPending}
          />
        )}
      </form.AppField>

      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Tên nhóm vật tư"
            required
            placeholder="Nhập tên nhóm, vd. Bulong"
            disabled={isPending}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Mô tả"
            placeholder="Mô tả ngắn về nhóm (không bắt buộc)"
            maxLength={500}
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
                  Lưu nhóm vật tư
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
