import { Button } from "web-qlsx-start"
import { Loader2, Plus, Trash2 } from "lucide-react"

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Tạo lệnh sản xuất</Button>
    <Button variant="secondary">Lưu nháp</Button>
    <Button variant="outline">Xuất Excel</Button>
    <Button variant="ghost">Hủy</Button>
    <Button variant="destructive">
      <Trash2 />
      Xóa sản phẩm
    </Button>
    <Button variant="link">Xem chi tiết</Button>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="xs">Rất nhỏ</Button>
    <Button size="sm">Nhỏ</Button>
    <Button size="default">Mặc định</Button>
    <Button size="lg">Lớn</Button>
    <Button size="icon" aria-label="Thêm mới">
      <Plus />
    </Button>
  </div>
)

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>Không khả dụng</Button>
    <Button disabled>
      <Loader2 className="animate-spin" />
      Đang lưu…
    </Button>
    <Button variant="outline" disabled>
      Chờ phê duyệt
    </Button>
  </div>
)
