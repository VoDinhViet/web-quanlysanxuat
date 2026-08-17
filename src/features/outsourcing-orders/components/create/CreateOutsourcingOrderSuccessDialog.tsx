import { CheckCircle2, FilePlus2, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PendingAction } from "@/components/shared/buttons/PendingAction"

type CreateOutsourcingOrderSuccessDialogProps = {
  open: boolean
  code: string
  totalQuantity: number
  totalWeight: number
  totalArea: number
  onBackToList: () => void
  onCreateAnother: () => void
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Bước ⑤ của ảnh mẫu — thay vì điều hướng ngay sau khi tạo, dừng lại ở dialog thành công để
// người dùng xem lại số liệu trước khi rời trang. "In phiếu xuất" giữ chỗ ở trạng thái disabled
// (PendingAction) — tính năng in phiếu chưa làm, không có route/API đứng sau nó.
export function CreateOutsourcingOrderSuccessDialog({
  open,
  code,
  totalQuantity,
  totalWeight,
  totalArea,
  onBackToList,
  onCreateAnother,
}: CreateOutsourcingOrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onBackToList()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </span>
          <DialogTitle className="text-lg">Tạo phiếu thành công!</DialogTitle>
          <p className="font-mono text-base font-semibold text-primary">
            {code}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-md border border-dashed border-border/50 bg-muted/20 p-4 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Tổng SL gửi</p>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Tổng KL</p>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
              {decimalFormatter.format(totalWeight)} kg
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Tổng DT</p>
            <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
              {decimalFormatter.format(totalArea)} m²
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <PendingAction
            label="In phiếu xuất (OS-OUT)"
            hint="Tính năng in phiếu chưa có"
          >
            <Printer className="size-4" />
            In phiếu xuất (OS-OUT)
          </PendingAction>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCreateAnother}
            >
              <FilePlus2 className="size-4" />
              Tạo phiếu mới
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onBackToList}>
              Về danh sách
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
