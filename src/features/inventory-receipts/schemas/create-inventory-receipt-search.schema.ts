import { z } from "zod"

// Deep-link tuỳ chọn cho /manage/inventory-receipts/create-from-job — giá trị khởi tạo cho
// combobox Job của InventoryReceiptCreateFromJobForm.tsx (nút "Nhập kho thành phẩm" trên tab Công
// đoạn của 1 Job, ProductionJobOperationsTab.tsx — lối vào duy nhất, thuộc tính năng Quản lý sản
// xuất), cùng khuôn create-outsourcing-order-search.schema.ts. Vào thẳng route không kèm param
// này vẫn hoạt động như cũ — combobox chỉ trống.
export const createInventoryReceiptSearchSchema = z.object({
  productionJobId: z.string().trim().min(1).optional().catch(undefined),
})

export type CreateInventoryReceiptSearchSchema = z.infer<
  typeof createInventoryReceiptSearchSchema
>
