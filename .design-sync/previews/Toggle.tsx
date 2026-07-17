import { Toggle } from "web-qlsx-start"
import { Bell, Bold, Italic } from "lucide-react"

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle aria-label="In đậm">
      <Bold />
    </Toggle>
    <Toggle variant="outline" aria-label="In nghiêng">
      <Italic />
    </Toggle>
    <Toggle variant="outline" defaultPressed>
      <Bell />
      Nhận thông báo
    </Toggle>
    <Toggle disabled>Không khả dụng</Toggle>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle size="sm" variant="outline">
      Nhỏ
    </Toggle>
    <Toggle size="default" variant="outline">
      Mặc định
    </Toggle>
    <Toggle size="lg" variant="outline">
      Lớn
    </Toggle>
  </div>
)
