import { useState } from "react"
import { Save } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type AdjustmentReasonDialogProps = {
  itemName: string
  reason: string
  trigger: ReactNode
  onSave: (reason: string) => void
}

// "Lý do điều chỉnh SL" can run long, and the outer table cell (CreateQuotationSuppliersItemColumns.tsx)
// only has room for a short trigger — so editing happens here instead of inline. Emits the edited
// string via onSave, same "transient command, parent owns the write" shape as
// QuotationAddSupplierDialog.tsx: adjustmentReason lives in itemsField (in-progress RFQ form
// state, not yet submitted), so this isn't its own persisted record and doesn't need
// useAppForm/a Zod schema — it just reads/writes one string.
export function AdjustmentReasonDialog({
  itemName,
  reason,
  trigger,
  onSave,
}: AdjustmentReasonDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-lg ring-0 sm:max-w-md">
        {/* Radix unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `reason`. */}
        <AdjustmentReasonDialogForm
          itemName={itemName}
          reason={reason}
          onSave={(value) => {
            onSave(value)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type AdjustmentReasonDialogFormProps = {
  itemName: string
  reason: string
  onSave: (reason: string) => void
  onCancel: () => void
}

function AdjustmentReasonDialogForm({
  itemName,
  reason,
  onSave,
  onCancel,
}: AdjustmentReasonDialogFormProps) {
  const [value, setValue] = useState(reason)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSave(value)
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Lý do điều chỉnh SL
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {itemName}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel
          htmlFor="adjustment-reason-textarea"
          className="text-xs font-medium text-foreground"
        >
          Lý do
        </FieldLabel>
        <Textarea
          id="adjustment-reason-textarea"
          placeholder="Nhập lý do điều chỉnh số lượng (nếu có)"
          className="min-h-24 resize-none bg-background text-xs"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </Field>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          <Save className="size-4" />
          Lưu
        </Button>
      </DialogFooter>
    </form>
  )
}
