import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { updateProductionJobOperation } from "@/features/production-jobs/api/server-functions/update-production-job-operation.api"

// One write, one hook — mirrors use-product-operations.ts's per-action hooks. Invalidates the
// whole feature (architecture.md convention), not a narrow key, so both the BOM tree
// (completedQuantity/completedDate) and anything else derived from it stay in sync. No success
// toast — this backs an auto-save-on-blur cell that can fire many times per session.
export function useUpdateProductionJobOperation(productionJobId: string) {
  const queryClient = useQueryClient()
  const updateFn = useServerFn(updateProductionJobOperation)

  return useMutation({
    mutationFn: (input: { operationId: string; completedQuantity: number }) =>
      updateFn({ data: { productionJobId, ...input } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
    },
    onError: (error) => toast.error(error.message),
  })
}
