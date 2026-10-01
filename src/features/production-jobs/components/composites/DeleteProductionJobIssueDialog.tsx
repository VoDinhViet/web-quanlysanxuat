import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteProductionJobIssue } from "@/features/production-jobs/api/server-functions/delete-production-job-issue.api"
import type { ProductionJobIssue } from "@/lib/types/production-job.type"

type DeleteProductionJobIssueDialogProps = {
  productionJobId: string
  issue: ProductionJobIssue
  trigger: ReactElement
}

// Removes the item from this Job only; the source product keeps it. "Tải lại từ sản phẩm"
// brings it back.
export function DeleteProductionJobIssueDialog({
  productionJobId,
  issue,
  trigger,
}: DeleteProductionJobIssueDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteLineFn = useServerFn(deleteProductionJobIssue)

  const { mutate: deleteLine, isPending } = useMutation({
    mutationFn: () =>
      deleteLineFn({ data: { productionJobId, issueId: issue.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
      toast.success("Đã xoá vật tư khỏi Job")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xoá vật tư khỏi Job?</AlertDialogTitle>
          <AlertDialogDescription>
            Vật tư {issue.item.code} — {issue.item.name} sẽ bị xoá khỏi Job này.
            Cấu trúc sản phẩm không thay đổi.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              deleteLine()
            }}
          >
            {isPending ? "Đang xoá..." : "Xoá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
