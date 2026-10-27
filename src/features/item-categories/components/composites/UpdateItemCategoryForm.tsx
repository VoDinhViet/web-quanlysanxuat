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
import { updateItemCategory } from "@/features/item-categories/api/server-functions/update-item-category.api"
import { updateItemCategorySchema } from "@/features/item-categories/schemas/update-item-category.schema"
import type { UpdateItemCategorySchema } from "@/features/item-categories/schemas/update-item-category.schema"
import type { ItemCategory } from "@/lib/types/item-category.type"

function getItemCategoryDefaultValues(
  itemCategory: ItemCategory
): UpdateItemCategorySchema {
  return {
    itemCategoryId: itemCategory.id,
    code: itemCategory.code,
    name: itemCategory.name,
    description: itemCategory.description ?? "",
  }
}

type UpdateItemCategoryFormProps = {
  itemCategory: ItemCategory
  onSuccess: () => void
  onCancel: () => void
}

export function UpdateItemCategoryForm({
  itemCategory,
  onSuccess,
  onCancel,
}: UpdateItemCategoryFormProps) {
  const queryClient = useQueryClient()
  const updateItemCategoryFn = useServerFn(updateItemCategory)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateItemCategorySchema) =>
      updateItemCategoryFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["item-categories"] })
      // Directs lists show the category name, so a rename must refresh them too.
      await queryClient.invalidateQueries({ queryKey: ["directs"] })
      onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getItemCategoryDefaultValues(itemCategory),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateItemCategorySchema,
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
        <DialogTitle className="text-base font-medium">
          Sửa nhóm vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Cập nhật mã, tên và mô tả nhóm vật tư
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
