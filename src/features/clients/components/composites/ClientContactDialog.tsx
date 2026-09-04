import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { clientContactFormSchema } from "@/features/clients/schemas/client-contact.schema"
import type { ClientContactInput } from "@/features/clients/schemas/client-contact.schema"

export const emptyContact: ClientContactInput = {
  name: "",
  position: "",
  phoneNumber: "",
  email: "",
  note: "",
}

type ClientContactDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // `null` = add mode; a contact value = edit mode.
  initialValue: ClientContactInput | null
  onSubmit: (value: ClientContactInput) => void
}

export function ClientContactDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: ClientContactDialogProps) {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      className="shadow-lg ring-0 sm:max-w-lg"
    >
      {/* The dialog unmounts content while closed, so this form re-mounts on each
          open and its state seeds fresh from `initialValue`. */}
      <ClientContactDialogForm
        initialValue={initialValue}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  )
}

type ClientContactDialogFormProps = {
  initialValue: ClientContactInput | null
  onSubmit: (value: ClientContactInput) => void
  onCancel: () => void
}

function ClientContactDialogForm({
  initialValue,
  onSubmit,
  onCancel,
}: ClientContactDialogFormProps) {
  const isEditing = initialValue !== null

  const form = useAppForm({
    defaultValues: initialValue ?? emptyContact,
    validators: {
      onSubmit: clientContactFormSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
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
          {isEditing ? "Sửa người liên hệ" : "Thêm người liên hệ"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thông tin người liên hệ của khách hàng
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Họ và tên"
                required
                placeholder="Nhập họ và tên"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="position">
          {(field) => (
            <field.TextField label="Chức vụ" placeholder="Nhập chức vụ" />
          )}
        </form.AppField>

        <form.AppField name="phoneNumber">
          {(field) => (
            <field.TextField
              label="Điện thoại"
              type="tel"
              placeholder="Nhập số điện thoại"
            />
          )}
        </form.AppField>

        <div className="sm:col-span-2">
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                placeholder="Nhập email"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              label="Ghi chú"
              placeholder="Nhập ghi chú (nếu có)"
              className="sm:col-span-2"
            />
          )}
        </form.AppField>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          <Check className="size-4" />
          Lưu
        </Button>
      </DialogFooter>
    </form>
  )
}
