import { z } from "zod"

import { ClientStatus } from "@/features/clients/types/client.type"

// Mirrors the backend's GetClientsReqDto (page, limit, q inherited from
// PageOptionsDto; status/clientGroupId are client-specific filters). The backend
// sorts newest-first and ignores the `order` param, so it isn't sent here.
export const clientsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ClientStatus).optional().catch(undefined),
  clientGroupId: z.string().trim().min(1).optional().catch(undefined),
})

export type ClientsSearchSchema = z.infer<typeof clientsSearchSchema>
