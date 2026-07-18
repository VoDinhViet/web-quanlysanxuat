import { z } from "zod"

import { ClientStatus } from "@/features/clients/types/client.type"

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string.
function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

// The client email is optional, so it only needs a format check when filled
// (email is already transformed to undefined-when-empty by clientProfileFields
// by the time this runs).
export function refineClientEmail(
  value: { email?: string },
  ctx: z.RefinementCtx
): void {
  if (value.email && !z.email().safeParse(value.email).success) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Email không đúng định dạng",
    })
  }
}

const clientProfileFields = {
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
    .transform(emptyToUndefined),
  phoneNumber: z
    .string()
    .trim()
    .max(30, "Số điện thoại tối đa 30 ký tự")
    .transform(emptyToUndefined),
  email: z.string().trim().transform(emptyToUndefined),
  address: z
    .string()
    .trim()
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(emptyToUndefined),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(ClientStatus),
}

// One contact row. `isPrimary` has no UI — the array transform below marks the
// first row primary, matching the list page's "Người liên hệ chính" column.
const clientContactFields = {
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(255, "Họ và tên tối đa 255 ký tự"),
  position: z.string().trim().transform(emptyToUndefined),
  phoneNumber: z.string().trim().transform(emptyToUndefined),
  email: z.string().trim().transform(emptyToUndefined),
  note: z.string().trim().transform(emptyToUndefined),
}

const clientContactsSchema = z
  .array(z.object(clientContactFields))
  .transform((contacts) =>
    contacts.map((contact, index) => ({ ...contact, isPrimary: index === 0 }))
  )

// Validation for the add/edit contact dialog's own form. Unlike the array
// element schema it keeps raw string fields (no empty->undefined transform) so
// the parsed value stays assignable to the `contacts` field-array element
// (`ClientContactInput`). The empty->undefined mapping happens once, at final
// submit, via `clientContactsSchema` above.
export const clientContactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên")
      .max(255, "Họ và tên tối đa 255 ký tự"),
    position: z.string().trim(),
    phoneNumber: z.string().trim(),
    email: z.string().trim(),
    note: z.string().trim(),
  })
  .superRefine(refineClientEmail)

export const createClientSchema = z
  .object({ ...clientProfileFields, contacts: clientContactsSchema })
  .superRefine(refineClientEmail)

export type CreateClientSchema = z.input<typeof createClientSchema>

// One contact row as the form/dialog edits it (before the array transform adds
// `isPrimary`). Shared by the contacts table and its add/edit dialog.
export type ClientContactInput = CreateClientSchema["contacts"][number]

export const CREATE_CLIENT_DEFAULT_VALUES: CreateClientSchema = {
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
