import { z } from "zod"

// Raw form shape for adding a BOM node. Wire mapping (quantity string → number,
// empty note → undefined) happens in the server function, not here. The
// integer-quantity rule for PRODUCT nodes is enforced by the backend (E055) and
// surfaced as a Vietnamese message, so it isn't duplicated client-side.
export const createBomItemSchema = z.object({
  itemType: z.enum(["PRODUCT", "MATERIAL"]),
  itemId: z.string().min(1, "Vui lòng chọn mục"),
  quantity: z.string().refine((value) => {
    const parsed = Number(value)
    return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0
  }, "Số lượng phải lớn hơn 0"),
  note: z.string(),
})

export type CreateBomItemSchema = z.infer<typeof createBomItemSchema>

export const CREATE_BOM_ITEM_DEFAULT_VALUES: CreateBomItemSchema = {
  itemType: "MATERIAL",
  itemId: "",
  quantity: "1",
  note: "",
}
