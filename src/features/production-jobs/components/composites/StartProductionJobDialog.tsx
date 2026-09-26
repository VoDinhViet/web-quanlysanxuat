import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import type { ReactElement } from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { startProductionJob } from "@/features/production-jobs/api/server-functions/start-production-job.api"
import {
  productionJobStatusLabels,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type StartProductionJobDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

// PENDING → IN_PROGRESS, one-way — no revert route exists (production-job.type.ts). Invalidates
// the whole "production-jobs" root, not just the detail key: the BOM tab's `canEdit` also
// depends on this status.
export function StartProductionJobDialog({
  job,
  trigger,
}: StartProductionJobDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const startProductionJobFn = useServerFn(startProductionJob)

  const mutation = useMutation({
    mutationFn: () =>
      startProductionJobFn({ data: { productionJobId: job.id } }),
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
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận kế hoạch Job này?</AlertDialogTitle>
          <AlertDialogDescription>
            BOM, nhu cầu vật tư và công đoạn của Job {job.code} sẽ được chốt
            theo cấu trúc sản phẩm hiện tại; vật tư thiếu tự sinh đề xuất mua.
            Job chuyển sang "
            {productionJobStatusLabels[ProductionJobStatus.IN_PROGRESS]}" và
            không thể quay lại.
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
            onClick={() => {
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
