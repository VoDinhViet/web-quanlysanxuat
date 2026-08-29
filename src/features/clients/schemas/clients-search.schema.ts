import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { ClientStatus } from "@/lib/types/client.type"

// Mirrors the backend's GetClientsReqDto (page, limit, q inherited from
// PageOptionsDto; status/clientGroupId are client-specific filters). The backend
// sorts newest-first and ignores the `order` param, so it isn't sent here.
export const clientsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ClientStatus).optional().catch(undefined),
  clientGroupId: z.string().trim().min(1).optional().catch(undefined),
})

export type ClientsSearchSchema = z.infer<typeof clientsSearchSchema>
