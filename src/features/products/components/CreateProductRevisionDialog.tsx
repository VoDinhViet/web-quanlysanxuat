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
import {
  CREATE_PRODUCT_REVISION_DEFAULT_VALUES,
  createProductRevisionSchema,
} from "@/features/products/schemas/create-product-revision.schema"
import type { CreateProductRevisionSchema } from "@/features/products/schemas/create-product-revision.schema"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

function suggestNextRevisionCode(revisions: ProductRevision[]): string {
  return `R${String(revisions.length + 1).padStart(2, "0")}`
}

type CreateRevisionPrefill = {
  sourceRevisionId: string
  setAsCurrent: boolean
}

type CreateProductRevisionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  revisions: ProductRevision[]
  activeRevisionId: string
  // Preselects the source revision (and whether the new one becomes current)
  // when opened from a specific row's "Nhân bản" action.
  prefill?: CreateRevisionPrefill
  onSubmit: (value: CreateProductRevisionSchema) => void
  isSubmitting?: boolean
}

export function CreateProductRevisionDialog({
  open,
  onOpenChange,
  revisions,
  activeRevisionId,
  prefill,
  onSubmit,
  isSubmitting,
}: CreateProductRevisionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {/* Radix unmounts content while closed, so this form re-mounts fresh
            (with a fresh suggested code) on each open. */}
        <CreateProductRevisionForm
          revisions={revisions}
          activeRevisionId={activeRevisionId}
          prefill={prefill}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreateProductRevisionFormProps = {
  revisions: ProductRevision[]
  activeRevisionId: string
  prefill?: CreateRevisionPrefill
  onSubmit: (value: CreateProductRevisionSchema) => void
  onCancel: () => void
  isSubmitting?: boolean
}

function CreateProductRevisionForm({
  revisions,
  activeRevisionId,
  prefill,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateProductRevisionFormProps) {
  const form = useAppForm({
    defaultValues: {
      ...CREATE_PRODUCT_REVISION_DEFAULT_VALUES,
      revisionNo: suggestNextRevisionCode(revisions),
      sourceRevisionId: prefill?.sourceRevisionId ?? activeRevisionId,
      setAsCurrent: prefill?.setAsCurrent ?? true,
    },
    validators: { onSubmit: createProductRevisionSchema },
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
          Tạo Revision mới
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chốt một bản mới từ thông tin hiện tại của sản phẩm
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="revisionNo">
          {(field) => (
            <field.TextField
              id="revision-code"
              label="Mã Revision"
              required
              placeholder="Ví dụ: R04"
            />
          )}
        </form.AppField>

        <form.AppField name="sourceRevisionId">
          {(field) => (
            <field.SelectField
              label="Sao chép từ"
              required
              placeholder="Chọn bản gốc"
              options={revisions.map((revision) => ({
                value: revision.id,
                label: revision.revisionNo,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              id="revision-note"
              label="Ghi chú thay đổi"
              placeholder="Mô tả thay đổi so với bản gốc (nếu có)"
              className="sm:col-span-2"
            />
          )}
        </form.AppField>

        <form.AppField name="setAsCurrent">
          {(field) => (
            <field.SwitchField
              label="Trạng thái"
              onLabel="Đặt làm bản hiện hành ngay"
              offLabel="Lưu làm bản nháp"
              className="sm:col-span-2"
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
          Tạo Revision
        </Button>
      </DialogFooter>
    </form>
  )
}
