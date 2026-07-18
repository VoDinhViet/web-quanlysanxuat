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
import { clientContactFormSchema } from "@/features/clients/schemas/create-client.schema"
import type { ClientContactInput } from "@/features/clients/schemas/create-client.schema"

export const EMPTY_CONTACT: ClientContactInput = {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {/* Radix unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `initialValue`. */}
        <ClientContactDialogForm
          initialValue={initialValue}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
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
    defaultValues: initialValue ?? EMPTY_CONTACT,
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
                id="contact-name"
                label="Họ và tên"
                required
                placeholder="Nhập họ và tên"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="position">
          {(field) => (
            <field.TextField
              id="contact-position"
              label="Chức vụ"
              placeholder="Nhập chức vụ"
            />
          )}
        </form.AppField>

        <form.AppField name="phoneNumber">
          {(field) => (
            <field.TextField
              id="contact-phone"
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
                id="contact-email"
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
              id="contact-note"
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
