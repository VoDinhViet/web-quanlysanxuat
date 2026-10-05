import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { ItemStatus } from "@/lib/types/item.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

// Vật tư (DIRECT) is a `type = "DIRECT"` row of the backend's `items` table (products+directs merged,
// see be-quanlysanxuat/docs/decisions/items-merge.md) — this feature never sends/reads `type`
// itself (the server function always fixes it to "DIRECT"). Status is `ItemStatus` from
// item.type.ts (ACTIVE/INACTIVE) — no separate `DirectStatus` enum; a status this feature
// shares 1:1 with `products` doesn't need its own name. Import `ItemStatus`/`itemStatusLabels`
// directly from `@/lib/types/item.type` at call sites.

/** Mirrors the backend's DirectResDto (GET /api/items?type=DIRECT, GET /api/items/:id) narrowed to
 *  the DIRECT-only fields this feature reads — `id`/`code`/`name`/`status`/`unit`/`client`/`image`/
 *  `note` are shared with FG (see `Item` in item.type.ts); `supplier`/`minStock`/8 extended
 *  fields below are always null/default on a non-DIRECT row and only meaningful here. No `group`/
 *  `type` (INTERNAL/CLIENT) — both concepts were dropped when products+directs merged into
 *  `items` (nhóm hàng hoá bỏ hẳn; ownership giờ suy từ `clientId` có set hay không). No
 *  `attachments` — `direct_attachments` was dropped too, only `image` remains. */
export type Direct = {
  id: string
  code: string
  name: string
  status: ItemStatus
  unit: Unit
  client: ClientRef | null
  image: FileResource | null
  /** Tồn thực tế (gộp mọi kho) — chỉ có khi gọi danh sách với `withOnHand`. */
  onHand?: number
  note: string | null
  supplier: SupplierRef | null
  /** Định mức tồn tối thiểu — quyết định badge Bình thường/Cảnh báo ở màn Tồn kho vật tư. */
  minStock: number
  directGrade: string | null
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

export type DirectImportKey =
  | "code"
  | "revision"
  | "name"
  | "unitCode"
  | "supplierCode"
  | "clientCode"
  | "minStock"
  | "specificWeight"
  | "directGrade"
  | "technicalStandard"
  | "dimensions"
  | "colorSurface"
  | "origin"
  | "leadTime"
  | "description"
  | "note"

export type DirectImportField = {
  key: DirectImportKey
  label: string
  required?: boolean
}

/** Column order mirrors the backend's ITEM_IMPORT_FIELDS (the Excel template). */
export const directImportFields: DirectImportField[] = [
  { key: "code", label: "Mã vật tư", required: true },
  { key: "revision", label: "Phiên bản" },
  { key: "name", label: "Tên vật tư", required: true },
  { key: "unitCode", label: "Mã ĐVT", required: true },
  { key: "supplierCode", label: "Mã NCC" },
  { key: "clientCode", label: "Mã khách hàng" },
  { key: "minStock", label: "Tồn tối thiểu" },
  { key: "specificWeight", label: "Trọng lượng riêng" },
  { key: "directGrade", label: "Mác vật tư" },
  { key: "technicalStandard", label: "Tiêu chuẩn" },
  { key: "dimensions", label: "Quy cách" },
  { key: "colorSurface", label: "Màu/Bề mặt" },
  { key: "origin", label: "Xuất xứ" },
  { key: "leadTime", label: "Thời gian giao" },
  { key: "description", label: "Mô tả" },
  { key: "note", label: "Ghi chú" },
]

export type DirectImportCellErrors = Partial<Record<DirectImportKey, string>>

/** One editable row of the import preview; every cell is kept as the raw string the user sees. */
export type DirectImportPreviewRow = {
  rowNumber: number
  values: Record<DirectImportKey, string>
}
