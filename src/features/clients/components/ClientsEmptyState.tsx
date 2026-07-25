import { Link } from "@tanstack/react-router"
import { Plus, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function ClientsEmptyState() {
  return (
    <TableEmptyState
      icon={UserRound}
      title="Chưa có khách hàng nào"
      description="Bắt đầu bằng cách thêm khách hàng đầu tiên vào danh sách của bạn."
      action={
        <PermissionGate permission="clients:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/clients/create">
              <Plus className="size-4" />
              Tạo khách hàng
            </Link>
          </Button>
        </PermissionGate>
      }
    />
  )
}
