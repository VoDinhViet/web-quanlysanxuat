import { Link } from "@tanstack/react-router"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function SuppliersEmptyState() {
  return (
    <TableEmptyState
      icon={Building2}
      title="Chưa có nhà cung cấp nào"
      description="Bắt đầu bằng cách thêm nhà cung cấp đầu tiên vào danh sách của bạn."
      action={
        <PermissionGate permission="suppliers:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/suppliers/create">
              <Plus className="size-4" />
              Thêm nhà cung cấp
            </Link>
          </Button>
        </PermissionGate>
      }
    />
  )
}
