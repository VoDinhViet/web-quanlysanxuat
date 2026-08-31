import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import type { ReactNode } from "react"

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
import { approveProductionJobOperations } from "@/features/production-jobs/api/server-functions/approve-production-job-operations.api"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ApproveProductionJobOperationsDialogProps = {
  job: ProductionJobDetail
  trigger: ReactNode
}

// Không đổi production_jobs.status — chỉ mở khoá PATCH .../operations/:operationId (E250 tới khi
// có). Một chiều, không có route huỷ duyệt. Cùng khuôn StartProductionJobDialog.tsx.
export function ApproveProductionJobOperationsDialog({
  job,
  trigger,
}: ApproveProductionJobOperationsDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const approveProductionJobOperationsFn = useServerFn(
    approveProductionJobOperations
  )

  const mutation = useMutation({
    mutationFn: () =>
      approveProductionJobOperationsFn({ data: { productionJobId: job.id } }),
    onSuccess: async () => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Xác nhận sản xuất công đoạn của Job này?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Job {job.code} sẽ mở khoá nhập SL hoàn thành/SL không đạt cho từng
            công đoạn. Sau khi duyệt, không thể quay lại trạng thái trước đó.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận sản xuất"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
