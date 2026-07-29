import { z } from "zod"

import { emptyToUndefined, refineOptionalEmail } from "@/lib/zod-transforms"

// One contact row shared by the create and update client schemas. `isPrimary` has no UI — the
// array transform below marks the first row primary, matching the list page's "Người liên hệ
// chính" column. Contacts are replace-all on both create and update (every row is freshly
// submitted, never partially patched), so there's no PATCH-specific "clear a field" semantics
// here — unlike the client's own top-level profile fields.
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

export const clientContactsSchema = z
  .array(z.object(clientContactFields))
  .transform((contacts) =>
    contacts.map((contact, index) => ({ ...contact, isPrimary: index === 0 }))
  )

// Validation for the add/edit contact dialog's own form. Unlike the array element schema it
// keeps raw string fields (no empty->undefined transform) so the parsed value stays assignable
// to the `contacts` field-array element (`ClientContactInput`). The empty->undefined mapping
// happens once, at final submit, via `clientContactsSchema` above.
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
  .superRefine(refineOptionalEmail("email"))

// One contact row as the form/dialog edits it (before the array transform adds `isPrimary`).
// Shared by the contacts table and its add/edit dialog.
export type ClientContactInput = z.input<typeof clientContactFormSchema>
