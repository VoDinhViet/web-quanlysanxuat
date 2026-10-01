import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Refresh } from "@solar-icons/react"
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
import { reloadProductionJobSnapshot } from "@/features/production-jobs/api/server-functions/reload-production-job-snapshot.api"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ReloadProductionJobSnapshotDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

// Chỉ Job PENDING. Invalidates the whole "production-jobs" root: the BOM/operations tabs and the
// detail header all read what the snapshot rewrites.
export function ReloadProductionJobSnapshotDialog({
  job,
  trigger,
}: ReloadProductionJobSnapshotDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const reloadSnapshotFn = useServerFn(reloadProductionJobSnapshot)

  const mutation = useMutation({
    mutationFn: () => reloadSnapshotFn({ data: { productionJobId: job.id } }),
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
            <Refresh />
          </AlertDialogMedia>
          <AlertDialogTitle>Tải lại dữ liệu từ sản phẩm gốc?</AlertDialogTitle>
          <AlertDialogDescription>
            BOM, nhu cầu vật tư và công đoạn của Job {job.code} sẽ được lấy lại
            theo cấu trúc sản phẩm hiện tại và ghi đè dữ liệu đang có trong Job.
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
            {mutation.isPending ? "Đang tải..." : "Tải lại"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
