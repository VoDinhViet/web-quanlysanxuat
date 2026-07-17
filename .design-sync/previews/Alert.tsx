import { Alert, AlertDescription, AlertTitle } from "web-qlsx-start"
import { AlertTriangle, Info } from "lucide-react"

export const Variants = () => (
  <div className="flex w-full max-w-md flex-col gap-4">
    <Alert>
      <Info />
      <AlertTitle>Lệnh sản xuất đã được phê duyệt</AlertTitle>
      <AlertDescription>
        LSX-2026-0341 đã chuyển sang trạng thái "Đang sản xuất".
      </AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>Thiếu nguyên vật liệu</AlertTitle>
      <AlertDescription>
        Thép C45 Ø40 trong kho không đủ cho lệnh LSX-2026-0342. Kiểm tra lại tồn
        kho trước khi bắt đầu.
      </AlertDescription>
    </Alert>
  </div>
)
