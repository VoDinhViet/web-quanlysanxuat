import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { updateProductRevisionSchema } from "@/features/products/schemas/update-product-revision.schema"
import type { UpdateProductRevisionSchema } from "@/features/products/schemas/update-product-revision.schema"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

type EditProductRevisionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  revision: ProductRevision | null
  onSubmit: (value: UpdateProductRevisionSchema) => void
  isSubmitting?: boolean
}

export function EditProductRevisionDialog({
  open,
  onOpenChange,
  revision,
  onSubmit,
  isSubmitting,
}: EditProductRevisionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {/* Radix unmounts content while closed, so this form re-mounts fresh
            (with the target revision's current values) on each open. */}
        <EditProductRevisionForm
          revision={revision}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

type EditProductRevisionFormProps = {
  revision: ProductRevision | null
  onSubmit: (value: UpdateProductRevisionSchema) => void
  onCancel: () => void
  isSubmitting?: boolean
}

function EditProductRevisionForm({
  revision,
  onSubmit,
  onCancel,
  isSubmitting,
}: EditProductRevisionFormProps) {
  const form = useAppForm({
    defaultValues: {
      revisionNo: revision?.revisionNo ?? "",
      note: revision?.note ?? "",
    },
    validators: { onSubmit: updateProductRevisionSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Sửa Revision
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Cập nhật mã và ghi chú của bản này
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <form.AppField name="revisionNo">
          {(field) => (
            <field.TextField
              id="edit-revision-code"
              label="Mã Revision"
              required
              placeholder="Ví dụ: R04"
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              id="edit-revision-note"
              label="Ghi chú thay đổi"
              placeholder="Mô tả thay đổi so với bản gốc (nếu có)"
            />
          )}
        </form.AppField>
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Check className="size-4" />
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </form>
  )
}
