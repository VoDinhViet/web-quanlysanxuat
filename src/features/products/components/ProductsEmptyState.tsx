import { Link } from "@tanstack/react-router"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function ProductsEmptyState() {
  return (
    <TableEmptyState
      icon={PackageOpen}
      title="Chưa có sản phẩm nào"
      description="Bắt đầu bằng cách thêm sản phẩm đầu tiên vào danh mục của bạn."
      action={
        <PermissionGate permission="items:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/products/create">
              <Plus className="size-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </PermissionGate>
      }
    />
  )
}
