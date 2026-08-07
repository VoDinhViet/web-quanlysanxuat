import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"

// Raw form shape for adding a BOM node — a node links to either a WIP
// (sub-assembly) or an RM (vật tư) item, picked via a type toggle in
// BomItemFormDialog. Wire mapping (quantity string → number, empty note →
// undefined) happens in the server function, not here. The integer-quantity
// rule (WIP only) is enforced by the backend and surfaced as a Vietnamese
// message, so it isn't duplicated client-side.
export const createBomItemSchema = z.object({
  // The WIP/RM item this node links to — named apart from the owner scope's
  // own `productId` (added by create-bom-item.api.ts) to avoid colliding
  // with it when the two schemas are merged.
  itemId: z.string().min(1, "Vui lòng chọn hạng mục"),
  quantity: z.string().refine((value) => {
    const parsed = Number(value)
    return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0
  }, "Số lượng phải lớn hơn 0"),
  note: z.string(),
  // Bản vẽ (PDF) riêng của node — không bắt buộc.
  drawing: fileFieldSchema.nullable(),
})

export type CreateBomItemSchema = z.infer<typeof createBomItemSchema>

export const CREATE_BOM_ITEM_DEFAULT_VALUES: CreateBomItemSchema = {
  itemId: "",
  quantity: "1",
  note: "",
  drawing: null,
}
