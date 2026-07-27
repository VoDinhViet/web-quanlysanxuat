import { z } from "zod"

import {
  clientContactsSchema,
  clientProfileFields,
  refineClientEmail,
} from "@/features/clients/schemas/client-form.schema"

// Wire contract for POST /api/clients — same profile/contacts fields as
// clientFormSchema (clientProfileFields/clientContactsSchema already leave
// every value wire-ready).
export const createClientSchema = z
  .object({ ...clientProfileFields, contacts: clientContactsSchema })
  .superRefine(refineClientEmail)

export type CreateClientSchema = z.input<typeof createClientSchema>
