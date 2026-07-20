import type { FileResource } from "@/lib/types/file.type"

export enum MaterialType {
  INTERNAL = "INTERNAL",
  CLIENT = "CLIENT",
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  [MaterialType.INTERNAL]: "Nội bộ",
  [MaterialType.CLIENT]: "Khách hàng",
}

export enum MaterialStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  [MaterialStatus.ACTIVE]: "Đang sử dụng",
  [MaterialStatus.INACTIVE]: "Ngừng sử dụng",
}

/** Mirrors the backend's nested unit/group/client/preferredSupplier relation
 *  (MaterialRefResDto), and doubles as the shape for each ref-list's options
 *  (GET /api/units, /api/material-groups, /api/clients, /api/suppliers). */
export type MaterialRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's nested creator/changer relation (maps from `credentials`). */
export type MaterialCreator = {
  id: string
  username: string
}

/** Mirrors the backend's MaterialAttachmentResDto — a join row carrying the
 *  registry file it points at. */
export type MaterialAttachment = {
  id: string
  file: FileResource
}

/** Mirrors the backend's MaterialResDto (GET /api/materials, GET /api/materials/:id).
 *  `preferredSupplier` and `attachments` are optional because the backend only
 *  loads those relations on the detail endpoint — list rows omit them entirely. */
export type Material = {
  id: string
  code: string
  name: string
  type: MaterialType
  status: MaterialStatus
  unit: MaterialRef
  group: MaterialRef
  client: MaterialRef | null
  image: FileResource | null
  note: string | null
  // Extended information (all optional)
  materialGrade: string | null
  technicalStandard: string | null
  dimensions: string | null
  specificWeight: string | null
  colorSurface: string | null
  description: string | null
  origin: string | null
  preferredSupplier?: MaterialRef | null
  leadTime: string | null
  attachments?: MaterialAttachment[]
  creator: MaterialCreator | null
  createdAt: string
  updatedAt: string
}

// Recursive JSON-safe value — `changes` is free-form audit data, but a bare
// `Record<string, unknown>` fails createServerFn's serializability check
// (unknown can't be proven JSON-safe across the RPC boundary), so it's
// narrowed to this closed union instead.
export type MaterialLogChangeValue =
  | string
  | number
  | boolean
  | null
  | MaterialLogChangeValue[]
  | { [key: string]: MaterialLogChangeValue }

/** Mirrors the backend's MaterialLogResDto (GET /api/materials/:id/logs). `changes`
 *  holds `{ field: { from, to } }` for UPDATE and the initial snapshot for CREATE. */
export type MaterialLog = {
  id: string
  action: string
  changes: Record<string, MaterialLogChangeValue>
  changer: MaterialCreator | null
  createdAt: string
}
