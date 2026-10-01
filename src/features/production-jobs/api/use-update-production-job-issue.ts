import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { updateProductionJobIssue } from "@/features/production-jobs/api/server-functions/update-production-job-issue.api"
import type { UpdateProductionJobIssueSchema } from "@/features/production-jobs/schemas/update-production-job-issue.schema"

// Sửa số lượng một dòng vật tư của Job (chỉ Job PENDING). Invalidate cả "production-jobs" để tab
// BOM đọc lại số mới. `onSuccess` được await trước callback của `mutate(...)` nên ô nhập chỉ trả
// về giá trị server sau khi bảng đã refetch xong — không nhấp nháy số cũ.
export function useUpdateProductionJobIssue() {
  const queryClient = useQueryClient()
  const updateIssueFn = useServerFn(updateProductionJobIssue)

  return useMutation({
    mutationFn: (input: UpdateProductionJobIssueSchema) =>
      updateIssueFn({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
      toast.success("Đã cập nhật số lượng vật tư")
    },
    onError: (error) => toast.error(error.message),
  })
}
