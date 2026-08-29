import { useState } from "react"
import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { JobOperationReportForm } from "@/features/production-execution/components/composites/JobOperationReportForm"
import type { ProductionExecutionPartRow } from "@/features/production-execution/components/composites/ProductionExecutionPartsTableColumns"

type JobOperationReportDialogProps = {
  partRow: ProductionExecutionPartRow
  disabledReason: string | null
  trigger: ReactNode
}

// Bấm "Nhập báo cáo" ở một dòng Part → mở dialog nhập ngay cho đúng công đoạn của dòng đó — thay
// hẳn cách cũ (bấm mũi tên để "chọn" rồi cuộn xuống xem form riêng bên dưới bảng). Radix unmounts
// nội dung khi đóng, nên form (và state mutation của nó) luôn khởi tạo mới mỗi lần mở, cùng idiom
// OutboundOrderRejectDialog.tsx.
export function JobOperationReportDialog({
  partRow,
  disabledReason,
  trigger,
}: JobOperationReportDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <JobOperationReportForm
          partRow={partRow}
          disabledReason={disabledReason}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
