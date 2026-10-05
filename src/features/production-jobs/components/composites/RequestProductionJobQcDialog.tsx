import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestProductionJobQc } from "@/features/production-jobs/api/server-functions/request-production-job-qc.api"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type RequestProductionJobQcDialogProps = {
  job: ProductionJobDetail
  trigger: ReactElement
}

// Tạo 1 phiếu OQC (một lô) gắn vào công đoạn Cấp 0 của Job — SL mặc định = toàn bộ phần đã hoàn thành
// chưa kiểm, giảm được nếu chỉ muốn kiểm một phần. Ghi vào bảng `oqc` nên invalidate cả 2 root,
// không riêng "production-jobs" (khác StartProductionJobDialog.tsx, chỉ đổi status của chính Job).
export function RequestProductionJobQcDialog({
  job,
  trigger,
}: RequestProductionJobQcDialogProps) {
  const [open, setOpen] = useState(false)
  const maxQuantity = job.oqcRequestableQuantity
  const [quantityText, setQuantityText] = useState(String(maxQuantity))
  const quantity = Number(quantityText)
  const isQuantityValid =
    quantityText.trim() !== "" && quantity > 0 && quantity <= maxQuantity
  const queryClient = useQueryClient()
  const requestProductionJobQcFn = useServerFn(requestProductionJobQc)

  const mutation = useMutation({
    mutationFn: () =>
      requestProductionJobQcFn({
        data: { productionJobId: job.id, quantity },
      }),
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
        if (next) {
          mutation.reset()
          setQuantityText(String(maxQuantity))
        }
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ClipboardCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Yêu cầu OQC thành phẩm cho Job này?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Job {job.code} sẽ được tạo 1 phiếu OQC (một lô) cho công đoạn lắp
            ráp cuối cùng. Lô qua OQC được nhập kho thành phẩm ngay, không cần
            chờ Job hoàn thành toàn bộ.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="oqc-lot-quantity">
            Số lượng lô OQC (tối đa {maxQuantity})
          </Label>
          <Input
            id="oqc-lot-quantity"
            type="number"
            min={0}
            max={maxQuantity}
            step="any"
            value={quantityText}
            onChange={(event) => setQuantityText(event.target.value)}
            disabled={mutation.isPending}
          />
          {!isQuantityValid ? (
            <p className="text-xs text-destructive">
              Nhập số lượng lớn hơn 0 và không quá {maxQuantity}.
            </p>
          ) : null}
        </div>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending || !isQuantityValid}
            onClick={() => {
              mutation.mutate()
            }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Yêu cầu OQC"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
