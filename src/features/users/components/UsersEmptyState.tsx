import { Link } from "@tanstack/react-router"
import { Plus, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function UsersEmptyState() {
  return (
    <TableEmptyState
      icon={UserRound}
      title="Chưa có nhân sự nào"
      description="Bắt đầu bằng cách thêm nhân sự đầu tiên vào hệ thống."
      action={
        <PermissionGate permission="users:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/users/create">
              <Plus className="size-4" />
              Thêm nhân sự
            </Link>
          </Button>
        </PermissionGate>
      }
    />
  )
}
