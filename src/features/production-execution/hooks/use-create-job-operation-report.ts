import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createJobOperationReport } from "@/features/production-execution/api/server-functions/create-job-operation-report.api"
import type { CreateJobOperationReportSchema } from "@/features/production-execution/schemas/create-job-operation-report.schema"

// Invalidate cả 2 feature: "production-execution" (bảng công việc + card tóm tắt của chính màn
// này) và "production-jobs" (tab "Công đoạn sản xuất" của màn "Quản lý sản xuất" đọc cùng
// production_job_operations — số liệu phải khớp nhau ở cả 2 màn sau khi báo cáo).
export function useCreateJobOperationReport() {
  const queryClient = useQueryClient()
  const createReportFn = useServerFn(createJobOperationReport)

  return useMutation({
    // `completedQuantityDelta` gửi thẳng — BE tự cộng dồn (khoá row), không tính tuyệt đối ở FE.
    mutationFn: (input: CreateJobOperationReportSchema) =>
      createReportFn({ data: input }),
    onSuccess: async () => {
      toast.success("Đã lưu báo cáo hoàn thành.")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-execution"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}
