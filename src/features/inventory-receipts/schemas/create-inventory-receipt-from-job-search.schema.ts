import { z } from "zod"

// Deep-link tuỳ chọn cho /manage/inventory-receipts/create-from-job — giá trị khởi tạo cho
// combobox Job của InventoryReceiptCreateFromJobForm.tsx (nút "Nhập kho thành phẩm" trên header chi
// tiết Job, ProductionJobDetailHeader.tsx — lối vào duy nhất, chỉ hiện khi Job WAITING_DELIVERY),
// cùng khuôn create-outsourcing-order-search.schema.ts. Vào thẳng route không kèm param này vẫn
// hoạt động như cũ — combobox chỉ trống.
export const createInventoryReceiptFromJobSearchSchema = z.object({
  productionJobId: z.string().trim().min(1).optional().catch(undefined),
})

export type CreateInventoryReceiptFromJobSearchSchema = z.infer<
  typeof createInventoryReceiptFromJobSearchSchema
>
