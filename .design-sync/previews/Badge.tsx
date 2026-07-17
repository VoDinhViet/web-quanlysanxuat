import { Badge } from "web-qlsx-start"
import { CheckCircle2, Clock } from "lucide-react"

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>Đang sản xuất</Badge>
    <Badge variant="secondary">Chờ phê duyệt</Badge>
    <Badge variant="destructive">Quá hạn</Badge>
    <Badge variant="outline">Bản nháp</Badge>
    <Badge variant="ghost">Đã lưu trữ</Badge>
    <Badge variant="link">Xem chi tiết</Badge>
  </div>
)

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>
      <CheckCircle2 />
      Hoàn thành
    </Badge>
    <Badge variant="secondary">
      <Clock />
      Đang chờ
    </Badge>
    <Badge variant="outline">SL: 250</Badge>
  </div>
)
