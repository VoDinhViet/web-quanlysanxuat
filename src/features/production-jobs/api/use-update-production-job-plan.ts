import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { updateProductionJobPlan } from "@/features/production-jobs/api/server-functions/update-production-job-plan.api"

export function useUpdateProductionJobPlan() {
  const queryClient = useQueryClient()
  const updatePlanFn = useServerFn(updateProductionJobPlan)

  return useMutation({
    mutationFn: (input: {
      productionJobId: string
      operations: Array<{
        id?: string
        operationIds?: string[]
        dueDate: string
      }>
    }) => updatePlanFn({ data: input }),
    onSuccess: async () => {
      toast.success("Đã lưu kế hoạch sản xuất.")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-execution"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
}
