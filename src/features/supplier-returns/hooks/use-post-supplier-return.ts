import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { postSupplierReturn } from "@/features/supplier-returns/api/server-functions/post-supplier-return.api"
import type { PostSupplierReturnSchema } from "@/features/supplier-returns/schemas/post-supplier-return.schema"

type UsePostSupplierReturnParams = {
  supplierReturnId: string
  onSuccess: () => void
}

// Kéo ra khỏi SupplierReturnDetailActions.tsx khi dialog "Xác nhận xuất trả" có thêm form
// (note/file đính kèm) — cùng lý do tách use-create-job-operation-report.ts. Không dùng toast,
// giữ nguyên cách hiện có: lỗi hiện inline trong dialog qua `mutation.error`.
export function usePostSupplierReturn({
  supplierReturnId,
  onSuccess,
}: UsePostSupplierReturnParams) {
  const queryClient = useQueryClient()
  const postSupplierReturnFn = useServerFn(postSupplierReturn)

  return useMutation({
    mutationFn: (value: PostSupplierReturnSchema) =>
      postSupplierReturnFn({ data: { supplierReturnId, ...value } }),
    onSuccess: async () => {
      // IQC liên kết đổi trạng thái (WAITING_RETURN → COMPLETED) trong cùng thao tác — invalidate
      // cả 2 cache. Phiếu trả sinh từ OS-IN còn kéo lùi status OS-OUT nguồn (COMPLETED/WAITING_QC
      // → PARTIAL/SENT), tiến độ công đoạn OUTSOURCE liên quan (BE `postSupplierReturn` →
      // `recomputeAffectedOutsourcing`), và SL còn được nhận hiện ở popup tạo OS-IN mới
      // (`receivedQuantityByOrderItemIdSubquery` cũng trừ SL trả) — invalidate cả 3 cache đó dù
      // phiếu trả không phải lúc nào cũng sinh từ OS-IN, rẻ hơn kiểm điều kiện ở FE.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["supplier-returns"] }),
        queryClient.invalidateQueries({ queryKey: ["iqc"] }),
        queryClient.invalidateQueries({ queryKey: ["outsourcing-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["outsourcing-receipts"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
      ])
      onSuccess()
    },
  })
}
