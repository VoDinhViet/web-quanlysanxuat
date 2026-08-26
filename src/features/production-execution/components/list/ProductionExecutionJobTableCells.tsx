import { Link, useSearch } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"

type ProductionExecutionJobActionsCellProps = {
  productionJobId: string
}

// Đọc `operationId` qua useSearch (route search hiện tại của chính trang danh sách) thay vì nhận
// qua prop cột — giữ `productionExecutionJobColumns` ở module scope (forms-and-ui.md: columns
// không được tạo lại mỗi render), cùng idiom OperationSendActionCell.tsx đọc `productionJobId` qua
// useParams. Trang chi tiết cần đúng operationId này để lọc bảng Part (C1 trong kế hoạch).
export function ProductionExecutionJobActionsCell({
  productionJobId,
}: ProductionExecutionJobActionsCellProps) {
  const { operationId } = useSearch({
    from: "/(authed)/manage_/production-execution/",
  })

  return (
    <IconButton
      label="Xem chi tiết"
      className="bg-background text-muted-foreground"
      asChild
    >
      <Link
        to="/manage/production-execution/$productionJobId"
        params={{ productionJobId }}
        search={{ operationId }}
      >
        <Eye className="size-3.5" />
      </Link>
    </IconButton>
  )
}
