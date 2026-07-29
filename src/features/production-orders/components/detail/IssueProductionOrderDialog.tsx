import { useState } from "react"
import { CircleCheck } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type IssueProductionOrderDialogProps = {
  production: ProductionOrderDetail
  isIssuing: boolean
  onConfirm: () => void
}

// "Duyệt LSX" lưu lại số lượng hiện có trên form rồi mới phát hành (xem
// ProductionOrderDetailPage's handleIssue) — nên xác nhận ở đây cảnh báo luôn việc này. Mutation
// do trang cha sở hữu (chung với "Lưu nháp"), nên dialog chỉ gọi `onConfirm` rồi đóng — kết quả
// báo qua toast như mọi mutation khác trong dự án, không giữ dialog mở chờ lỗi.
export function IssueProductionOrderDialog({
  production,
  isIssuing,
  onConfirm,
}: IssueProductionOrderDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" disabled={isIssuing}>
          <CircleCheck className="size-4" />
          Duyệt LSX
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleCheck />
          </AlertDialogMedia>
          <AlertDialogTitle>Duyệt lệnh sản xuất này?</AlertDialogTitle>
          <AlertDialogDescription>
            Số lượng sản xuất hiện có trên bảng sẽ được lưu lại và chốt phát
            hành cho đơn hàng {production.orderCode}. Sau khi duyệt, các dòng sẽ
            không thể sửa lại.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              setOpen(false)
              onConfirm()
            }}
          >
            Duyệt LSX
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
