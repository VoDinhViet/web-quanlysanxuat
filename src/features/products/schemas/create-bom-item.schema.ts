import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"

// Raw form shape for adding a BOM node — a node links to either a WIP
// (sub-assembly) or an RM (vật tư) item, the type picked from the menu the
// user clicked in ProductBomTable (BomRowActions/RootAddButton) before the
// dialog even opened. Empty note → undefined happens in the server function,
// not here. The integer-quantity rule (WIP only) is enforced by the backend
// and surfaced as a Vietnamese message, so it isn't duplicated client-side.
export const createBomItemSchema = z.object({
  // The WIP/RM item this node links to — named apart from the owner scope's
  // own `rootItemId` (added by create-bom-item.api.ts) to avoid colliding
  // with it when the two schemas are merged.
  itemId: z.string().min(1, "Vui lòng chọn hạng mục"),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  note: z.string(),
  // Bản vẽ (PDF) riêng của node — không bắt buộc.
  drawing: fileFieldSchema.nullable(),
})

export type CreateBomItemSchema = z.input<typeof createBomItemSchema>

export const createBomItemDefaultValues: CreateBomItemSchema = {
  itemId: "",
  quantity: 1,
  note: "",
  drawing: null,
}
