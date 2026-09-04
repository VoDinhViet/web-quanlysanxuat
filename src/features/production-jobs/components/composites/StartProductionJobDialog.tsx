import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import type { ReactNode } from "react"

import {
  AlertDialog,
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
  trigger: ReactNode
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
    <AlertDialogTrigger
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) mutation.reset()
      }}
    >
      {trigger}
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận sản xuất Job này?</AlertDialogTitle>
          <AlertDialogDescription>
            Job {job.code} sẽ chuyển sang trạng thái "
            {productionJobStatusLabels[ProductionJobStatus.IN_PROGRESS]}". Sau
            khi xác nhận, không thể quay lại trạng thái trước đó.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            isDisabled={mutation.isPending}
            onPress={() => {
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
