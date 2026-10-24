import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type UseNcrActionOptions = {
  mutationFn: (ncrId: string) => Promise<void>
  successMessage: string
}

// One-click NCR workflow action (gửi duyệt / duyệt / đóng / tạo LSX ...) — every one of them can
// move the NCR, its LSX phụ, the re-OQC sheet and the source Job, so they all refresh the same
// feature roots.
export function useNcrAction({
  mutationFn,
  successMessage,
}: UseNcrActionOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ncrs"] }),
        queryClient.invalidateQueries({ queryKey: ["production-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["oqc"] }),
        queryClient.invalidateQueries({
          queryKey: ["reports", "pending-approvals"],
        }),
      ])
      toast.success(successMessage)
    },
    onError: (error) => toast.error(error.message),
  })
}
