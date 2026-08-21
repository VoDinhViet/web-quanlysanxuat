import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"
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
import { requestProductionJobQc } from "@/features/production-jobs/api/server-functions/request-production-job-qc.api"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type RequestProductionJobQcDialogProps = {
  job: ProductionJobDetail
  trigger: ReactNode
}

// Tạo 1 phiếu OQC gắn vào công đoạn Cấp 0 của Job — ghi vào bảng `oqc` nên invalidate cả 2 root,
// không riêng "production-jobs" (khác StartProductionJobDialog.tsx, chỉ đổi status của chính Job).
export function RequestProductionJobQcDialog({
  job,
  trigger,
}: RequestProductionJobQcDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const requestProductionJobQcFn = useServerFn(requestProductionJobQc)

  const mutation = useMutation({
    mutationFn: () =>
      requestProductionJobQcFn({ data: { productionJobId: job.id } }),
    onSuccess: async () => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["oqc"] }),
      ])
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
            <ClipboardCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Yêu cầu QC thành phẩm cho Job này?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Job {job.code} sẽ được tạo 1 phiếu OQC cho công đoạn lắp ráp cuối
            cùng. Chỉ thực hiện được một lần cho tới khi phiếu được xử lý.
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
            {mutation.isPending ? "Đang xử lý..." : "Yêu cầu QC"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
