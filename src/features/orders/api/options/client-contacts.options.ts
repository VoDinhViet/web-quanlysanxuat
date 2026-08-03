import { queryOptions } from "@tanstack/react-query"

import { getClientContacts } from "@/features/orders/api/server-functions/get-client-contacts.api"

// "Người liên hệ" picker in OrderContactSelect.tsx: contacts for whichever
// client is currently selected, fetched only when a client is picked (see
// the `enabled: !!clientId` at the call site).
export const clientContactsQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ["orders", "client-contacts", clientId],
    queryFn: () => getClientContacts({ data: { clientId } }),
  })
