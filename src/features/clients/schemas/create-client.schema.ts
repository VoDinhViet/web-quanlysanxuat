import { z } from "zod"

import { clientContactsSchema } from "@/features/clients/schemas/client-contact.schema"
import { emptyToUndefined, refineOptionalEmail } from "@/lib/zod-transforms"

import { ClientStatus } from "@/lib/types/client.type"

// Wire contract for POST /api/clients — also the client-side onSubmit validator for
// CreateClientForm. Every optional field transforms "" straight to undefined here, so the
// parsed value is already wire-ready — no separate mapping step. Deliberately shares no field
// definitions with update-client.schema.ts: the two flows evolve independently.
export const createClientSchema = z
  .object({
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
    contacts: clientContactsSchema,
  })
  .superRefine(refineOptionalEmail("email"))

export type CreateClientSchema = z.input<typeof createClientSchema>

export const createClientFormDefaultValues: CreateClientSchema = {
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
