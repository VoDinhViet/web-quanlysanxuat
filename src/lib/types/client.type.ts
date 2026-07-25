export enum ClientStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  [ClientStatus.ACTIVE]: "Hoạt động",
  [ClientStatus.PAUSED]: "Tạm ngưng",
}

/** Mirrors the backend's nested client-group relation (GET /api/client-groups). */
export type ClientGroupRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's ClientContactResDto — a client can have several
 *  contacts; at most one has `isPrimary: true`. */
export type ClientContact = {
  id: string
  name: string
  position: string | null
  phoneNumber: string | null
  email: string | null
  note: string | null
  isPrimary: boolean
}

/** Mirrors the backend's nested creator relation. */
export type ClientCreatorRef = {
  id: string
  username: string
}

/** Mirrors the backend's ClientResDto (GET /api/clients, GET /api/clients/:id). */
export type Client = {
  id: string
  code: string
  name: string
  group: ClientGroupRef
  taxCode: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
  note: string | null
  status: ClientStatus
  contacts: ClientContact[]
  creator: ClientCreatorRef | null
  createdAt: string
  updatedAt: string
}
