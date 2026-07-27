import { z } from "zod"

import {
  clientContactsSchema,
  clientProfileFields,
  refineClientEmail,
} from "@/features/clients/schemas/client-form.schema"

// Wire contract for PATCH /api/clients/:id — same profile/contacts fields as
// create (clientProfileFields/clientContactsSchema already leave every value
// wire-ready), plus the id to route the request.
export const updateClientSchema = z
  .object({
    clientId: z.uuid(),
    ...clientProfileFields,
    contacts: clientContactsSchema,
  })
  .superRefine(refineClientEmail)

export type UpdateClientSchema = z.input<typeof updateClientSchema>
