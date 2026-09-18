import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { updateJobOperationDueDate } from "@/features/production-jobs/api/server-functions/update-job-operation-due-date.api"

// Invalidate cả 2 feature: "production-execution" (màn "Thực hiện sản xuất") và "production-jobs"
// (tab "Công đoạn sản xuất") đọc cùng production_job_operations — số liệu phải khớp nhau ở cả 2
// màn sau khi đặt/sửa hạn, cùng khuôn useCreateJobOperationReport.
export function useUpdateJobOperationDueDate() {
  const queryClient = useQueryClient()
  const updateDueDateFn = useServerFn(updateJobOperationDueDate)

  return useMutation({
    mutationFn: (input: {
      productionJobId: string
      jobOperationId: string
      dueDate: string
    }) => updateDueDateFn({ data: input }),
    onSuccess: async () => {
      toast.success("Đã lưu hạn hoàn thành.")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-execution"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}
