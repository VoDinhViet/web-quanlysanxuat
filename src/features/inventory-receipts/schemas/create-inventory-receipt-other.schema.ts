import {
  createInventoryReceiptFormDefaultValues,
  createInventoryReceiptSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import {
  InventoryReceiptAssetType,
  InventoryReceiptType,
} from "@/lib/types/inventory-receipt.type"

// Validator cho chế độ "Nhập từ khác" (?source=other trên route create,
// InventoryReceiptCreateOtherForm.tsx) — dùng lại nguyên createInventoryReceiptSchema, chỉ refine
// thêm bắt buộc `note` ("PO / Lý do" — ô header của chế độ này thay cho "Ghi chú" thường). `refine`
// (không `.extend()`) giữ nguyên z.input y hệt CreateInventoryReceiptSchema — cần thiết để
// InventoryReceiptCreateGenericItemsSection (withForm khoá cứng theo type đó) tái dùng được thẳng,
// không phải ép kiểu ở call site.
export const createInventoryReceiptOtherSchema =
  createInventoryReceiptSchema.refine((value) => Boolean(value.note), {
    message: "Vui lòng nhập PO / Lý do",
    path: ["note"],
  })

// receiptType cố định ADJUSTMENT, requiresIqc khởi tạo false (radio QC ở
// InventoryReceiptCreateOtherHeaderSection.tsx) — annotate kiểu tường minh thay vì suy luận, cùng
// lý do đã ghi ở InventoryReceiptCreateFromJobForm.tsx: spread một literal `receiptType:
// "ADJUSTMENT"` vào object literal sẽ ép cả object type hẹp lại thành literal đó thay vì union
// InventoryReceiptType mà createInventoryReceiptSchema validate.
export const createInventoryReceiptOtherFormDefaultValues: CreateInventoryReceiptSchema =
  {
    ...createInventoryReceiptFormDefaultValues,
    receiptType: InventoryReceiptType.ADJUSTMENT,
    assetType: InventoryReceiptAssetType.COMPANY,
    requiresIqc: false,
  }
