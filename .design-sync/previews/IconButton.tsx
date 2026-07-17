import { IconButton } from "web-qlsx-start"
import { Pencil, RefreshCw, Trash2 } from "lucide-react"

export const Actions = () => (
  <div className="flex items-center gap-2">
    <IconButton label="Chỉnh sửa">
      <Pencil />
    </IconButton>
    <IconButton label="Làm mới">
      <RefreshCw />
    </IconButton>
    <IconButton label="Xóa">
      <Trash2 className="text-destructive" />
    </IconButton>
  </div>
)
