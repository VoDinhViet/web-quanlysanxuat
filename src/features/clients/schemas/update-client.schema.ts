import { z } from "zod"

import { clientContactsSchema } from "@/features/clients/schemas/client-contact.schema"
import {
  emptyToNull,
  optionalEmail,
  refineOptionalPhoneNumber,
} from "@/lib/zod-transforms"

import { ClientStatus } from "@/lib/types/client.type"

// Wire contract for PATCH /api/clients/:id — also the client-side onSubmit validator for
// UpdateClientForm. `clientId` lives directly in the form's own state (the update flow's
// sections are its own components, not shared with CreateClientForm, so there's no
// withForm-invariance conflict), so mutationFn receives the form value as-is — no manual id
// merge at the call site. Deliberately shares no field definitions with create-client.schema.ts:
// on a PATCH an omitted key means "leave unchanged", not "not provided", so every optional field
// here transforms ""→null (an explicit clear) instead of ""→undefined — see UpdateClientReqDto's
// `nullable: true` fields on the backend.
export const updateClientSchema = z
  .object({
    clientId: z.uuid(),
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên khách hàng")
      .max(255, "Tên khách hàng tối đa 255 ký tự"),
    clientGroupId: z.string().trim().min(1, "Vui lòng chọn nhóm khách hàng"),
    taxCode: z
      .string()
      .trim()
      .max(50, "Mã số thuế tối đa 50 ký tự")
      .transform(emptyToNull),
    phoneNumber: z
      .string()
      .trim()
      .max(30, "Số điện thoại tối đa 30 ký tự")
      .transform(emptyToNull),
    // optionalEmail() transforms ""→undefined; a PATCH needs an explicit null to actually clear
    // the field (an omitted key means "leave unchanged"), so re-map the last step.
    email: optionalEmail().transform((value) => value ?? null),
    address: z
      .string()
      .trim()
      .max(500, "Địa chỉ tối đa 500 ký tự")
      .transform(emptyToNull),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự")
      .transform(emptyToNull),
    status: z.enum(ClientStatus),
    contacts: clientContactsSchema,
  })
  .superRefine(refineOptionalPhoneNumber("phoneNumber"))

export type UpdateClientSchema = z.input<typeof updateClientSchema>

// Only used for withForm's type inference in the update flow's own sections — the real values
// always come from UpdateClientForm's own `defaultValues`, so placeholders here are harmless.
export const updateClientFormDefaultValues: UpdateClientSchema = {
  clientId: "",
  name: "",
  clientGroupId: "",
  taxCode: "",
  phoneNumber: "",
  email: "",
  address: "",
  note: "",
  status: ClientStatus.ACTIVE,
  contacts: [],
}
