import {
  createInventoryReceiptFormDefaultValues,
  createInventoryReceiptSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import {
  InventoryReceiptAssetType,
  InventoryReceiptType,
} from "@/lib/types/inventory-receipt.type"

// Validator cho làn "Khách hàng" (?lane=return trên route create-receipt,
// InventoryReceiptCreateReturnForm.tsx) — dùng lại nguyên createInventoryReceiptSchema, chỉ
// refine thêm bắt buộc `clientId` (khách hàng cung cấp vật tư). `note` để tuỳ chọn — đã có combobox
// khách hàng xác định nguồn rõ ràng, không cần ép nhập lý do như làn "Khác". `refine` (không
// `.extend()`) giữ nguyên z.input y hệt CreateInventoryReceiptSchema — cần thiết để
// InventoryReceiptCreateGenericItemsSection (withForm khoá cứng theo type đó) tái dùng được
// thẳng, không phải ép kiểu ở call site.
export const createInventoryReceiptReturnSchema =
  createInventoryReceiptSchema.refine((value) => Boolean(value.clientId), {
    message: "Vui lòng chọn khách hàng",
    path: ["clientId"],
  })

// receiptType cố định RETURN, requiresIqc khởi tạo false (radio QC ở
// InventoryReceiptCreateReturnHeaderSection.tsx) — annotate kiểu tường minh thay vì suy luận,
// cùng lý do đã ghi ở create-inventory-receipt-other.schema.ts.
export const createInventoryReceiptReturnFormDefaultValues: CreateInventoryReceiptSchema =
  {
    ...createInventoryReceiptFormDefaultValues,
    receiptType: InventoryReceiptType.RETURN,
    assetType: InventoryReceiptAssetType.CLIENT,
    requiresIqc: false,
  }
