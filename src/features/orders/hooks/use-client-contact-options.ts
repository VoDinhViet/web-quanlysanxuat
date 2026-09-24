import { useQuery } from "@tanstack/react-query"

import { clientQueryOptions } from "@/features/clients/api"

// Options for the order form's "Người liên hệ" select — the contacts of the client picked above
// it. Shares the query key with ClientPicker's own detail read, so it costs no extra request.
export function useClientContactOptions(clientId: string | undefined) {
  const { data: client, isFetching } = useQuery({
    ...clientQueryOptions(clientId ?? ""),
    enabled: !!clientId,
  })

  const options = (client?.contacts ?? []).map((contact) => ({
    value: contact.id,
    label: [contact.name, contact.position, contact.phoneNumber]
      .filter(Boolean)
      .join(" - "),
  }))

  return { options, isPending: !!clientId && isFetching }
}
