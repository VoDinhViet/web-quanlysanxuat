import { Link } from "@tanstack/react-router"
import { PackageOpen, Plus, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"

type MaterialsEmptyStateProps = {
  /** True when a search/filter is active — the list is empty because nothing
   *  matched, not because no materials exist yet. */
  isFiltered: boolean
}

export function MaterialsEmptyState({ isFiltered }: MaterialsEmptyStateProps) {
  const Icon = isFiltered ? SearchX : PackageOpen

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        <Icon className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {isFiltered ? "Không tìm thấy vật tư phù hợp" : "Chưa có vật tư nào"}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {isFiltered
            ? "Thử điều chỉnh từ khóa hoặc bộ lọc để xem thêm kết quả."
            : "Bắt đầu bằng cách thêm vật tư đầu tiên vào danh mục của bạn."}
        </p>
      </div>
      {!isFiltered ? (
        <PermissionGate permission="materials:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/materials/create">
              <Plus className="size-4" />
              Thêm vật tư
            </Link>
          </Button>
        </PermissionGate>
      ) : null}
    </div>
  )
}
