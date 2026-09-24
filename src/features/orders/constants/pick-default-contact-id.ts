import type { Client } from "@/lib/types/client.type"

// The contact an order defaults to right after its client is picked: the client's primary contact,
// else the first one, else none ("" — the form's empty value for an id field).
export function pickDefaultContactId(client: Client | undefined): string {
  const contact =
    client?.contacts.find((item) => item.isPrimary) ?? client?.contacts.at(0)

  return contact?.id ?? ""
}
