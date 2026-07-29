import type { AnyFormApi } from "@tanstack/react-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { useGetClientContacts } from "@/features/orders/hooks/use-get-client-contacts"

type OrderContactSelectProps = {
  form: AnyFormApi
  clientId: string
  disabled?: boolean
}

// Not a bound form field — "Người liên hệ" is a convenience picker over the selected
// client's contacts, fetched on demand (GET /api/clients/:id/contacts) only once a client is
// picked. Picking one just fills 3 free-text fields; the picked contact's id itself is never
// sent to the backend. Takes a plain `form: AnyFormApi` (only calls `form.setFieldValue`)
// rather than being built with `withForm`, so it's shared as-is by both
// CreateOrderInfoSection and UpdateOrderInfoSection despite their differing form shapes.
export function OrderContactSelect({
  form,
  clientId,
  disabled,
}: OrderContactSelectProps) {
  const { contacts, isPending } = useGetClientContacts(clientId)

  const isDisabled = disabled || isPending || contacts.length === 0

  function getPlaceholder() {
    if (!clientId) return "Chọn khách hàng trước"
    if (isPending) return "Đang tải người liên hệ..."
    if (contacts.length === 0) return "Khách hàng chưa có người liên hệ"

    return "Chọn người liên hệ"
  }

  const handleValueChange = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)

    form.setFieldValue("contactName", contact?.name ?? "")
    form.setFieldValue("contactPhone", contact?.phoneNumber ?? "")
    form.setFieldValue("contactEmail", contact?.email ?? "")
  }

  return (
    <Field>
      <FieldLabel className="text-xs font-medium text-foreground">
        Người liên hệ
      </FieldLabel>

      <Select disabled={isDisabled} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9 w-full bg-background text-xs">
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>

        <SelectContent>
          {contacts.map((contact) => (
            <SelectItem key={contact.id} value={contact.id} className="text-xs">
              {contact.name}
              {contact.isPrimary && " (chính)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
