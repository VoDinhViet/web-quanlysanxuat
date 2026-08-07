import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

export enum MaterialType {
  INTERNAL = "INTERNAL",
  CLIENT = "CLIENT",
}

export const materialTypeLabels: Record<MaterialType, string> = {
  [MaterialType.INTERNAL]: "Nội bộ",
  [MaterialType.CLIENT]: "Khách hàng",
}

export enum MaterialStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const materialStatusLabels: Record<MaterialStatus, string> = {
  [MaterialStatus.ACTIVE]: "Đang sử dụng",
  [MaterialStatus.INACTIVE]: "Ngừng sử dụng",
}

/** Mirrors the backend's nested material-group relation (GET /api/material-groups). */
export type MaterialGroupRef = {
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
  unit: Unit
  group: MaterialGroupRef
  client: ClientRef | null
  image: FileResource | null
  note: string | null
  // Extended information (all optional)
  materialGrade: string | null
  technicalStandard: string | null
  dimensions: string | null
  specificWeight: number | null
  colorSurface: string | null
  description: string | null
  origin: string | null
  preferredSupplier?: SupplierRef | null
  leadTime: string | null
  attachments?: MaterialAttachment[]
  creator: MaterialCreator | null
  createdAt: string
  updatedAt: string
}
