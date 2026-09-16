import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { ItemStatus } from "@/lib/types/item.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

// Vật tư (CONSUMABLE) is a `type = "CONSUMABLE"` row of the backend's `items` table (products+consumables merged,
// see be-quanlysanxuat/docs/decisions/items-merge.md) — this feature never sends/reads `type`
// itself (the server function always fixes it to "CONSUMABLE"). Status is `ItemStatus` from
// item.type.ts (ACTIVE/INACTIVE) — no separate `ConsumableStatus` enum; a status this feature
// shares 1:1 with `products` doesn't need its own name. Import `ItemStatus`/`itemStatusLabels`
// directly from `@/lib/types/item.type` at call sites.

/** Mirrors the backend's ConsumableResDto (GET /api/items?type=CONSUMABLE, GET /api/items/:id) narrowed to
 *  the CONSUMABLE-only fields this feature reads — `id`/`code`/`name`/`status`/`unit`/`client`/`image`/
 *  `note` are shared with FG (see `Item` in item.type.ts); `supplier`/`minStock`/8 extended
 *  fields below are always null/default on a non-CONSUMABLE row and only meaningful here. No `group`/
 *  `type` (INTERNAL/CLIENT) — both concepts were dropped when products+consumables merged into
 *  `items` (nhóm hàng hoá bỏ hẳn; ownership giờ suy từ `clientId` có set hay không). No
 *  `attachments` — `consumable_attachments` was dropped too, only `image` remains. */
export type Consumable = {
  id: string
  code: string
  name: string
  status: ItemStatus
  unit: Unit
  client: ClientRef | null
  image: FileResource | null
  note: string | null
  supplier: SupplierRef | null
  /** Định mức tồn tối thiểu — quyết định badge Bình thường/Cảnh báo ở màn Tồn kho vật tư. */
  minStock: number
  consumableGrade: string | null
  technicalStandard: string | null
  dimensions: string | null
  specificWeight: number | null
  colorSurface: string | null
  description: string | null
  origin: string | null
  leadTime: string | null
  createdAt: string
  updatedAt: string
}
