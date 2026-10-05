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
// CreateInventoryReceiptReturnForm.tsx) — dùng lại nguyên createInventoryReceiptSchema, chỉ
// refine thêm bắt buộc `clientId` (khách hàng cung cấp vật tư gia công, không phải khách trả lại
// hàng đã mua — xem CreateInventoryReceiptReturnHeaderSection.tsx) và `reason` ("PO / Lý do" Kho
// ghi để biết lô hàng nhập làm gì, hiện ở cột "PO / Lý do" của danh sách phiếu nhập; BE không
// ép). `note` để tuỳ chọn. `refine` (không `.extend()`) giữ nguyên z.input y hệt
// CreateInventoryReceiptSchema — cần thiết để CreateInventoryReceiptGenericItemsSection (withForm
// khoá cứng theo type đó) tái dùng được thẳng, không phải ép kiểu ở call site.
export const createInventoryReceiptReturnSchema = createInventoryReceiptSchema
  .refine((value) => Boolean(value.clientId), {
    message: "Vui lòng chọn khách hàng",
    path: ["clientId"],
  })
  .refine((value) => Boolean(value.reason), {
    message: "Vui lòng nhập PO / Lý do nhập",
    path: ["reason"],
  })

// receiptType cố định RETURN, requiresIqc khởi tạo false (radio QC ở
// CreateInventoryReceiptReturnHeaderSection.tsx) — annotate kiểu tường minh thay vì suy luận:
// spread một literal `receiptType: "RETURN"` vào object literal sẽ ép cả object type hẹp lại
// thành literal đó thay vì union InventoryReceiptType mà createInventoryReceiptSchema validate.
export const createInventoryReceiptReturnFormDefaultValues: CreateInventoryReceiptSchema =
  {
    ...createInventoryReceiptFormDefaultValues,
    receiptType: InventoryReceiptType.RETURN,
    assetType: InventoryReceiptAssetType.CLIENT,
    requiresIqc: false,
  }
