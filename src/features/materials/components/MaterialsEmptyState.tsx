import { Link } from "@tanstack/react-router"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function MaterialsEmptyState() {
  return (
    <TableEmptyState
      icon={PackageOpen}
      title="Chưa có vật tư nào"
      description="Bắt đầu bằng cách thêm vật tư đầu tiên vào danh mục của bạn."
      action={
        <PermissionGate permission="materials:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/materials/create">
              <Plus className="size-4" />
              Thêm vật tư
            </Link>
          </Button>
        </PermissionGate>
      }
    />
  )
}
