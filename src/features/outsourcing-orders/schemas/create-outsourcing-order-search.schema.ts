import { z } from "zod"

// Deep-link tuỳ chọn cho /manage/outsourcing-orders/create — cho phép mở thẳng wizard đã lọc sẵn
// Job/Công đoạn (vd từ nút "Gửi gia công ngoài" trên bảng công đoạn của 1 Job), thay vì luôn bắt
// đầu trống. Vào thẳng route không kèm 2 param này vẫn hoạt động như cũ.
export const createOutsourcingOrderSearchSchema = z.object({
  productionJobId: z.string().trim().min(1).optional().catch(undefined),
  operationId: z.string().trim().min(1).optional().catch(undefined),
})

export type CreateOutsourcingOrderSearchSchema = z.infer<
  typeof createOutsourcingOrderSearchSchema
>
