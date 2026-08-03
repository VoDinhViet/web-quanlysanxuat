import { useQuery } from "@tanstack/react-query"

import { clientContactsQueryOptions } from "@/features/orders/api/options"

// Only fetches once a client is picked — `enabled: !!clientId` skips the
// request entirely before then (see the `disabled` placeholder states at the
// call site, OrderContactSelect.tsx).
export function useGetClientContacts(clientId: string) {
  const { data: contacts = [], isPending } = useQuery({
    ...clientContactsQueryOptions(clientId),
    enabled: !!clientId,
  })

  return { contacts, isPending }
}
