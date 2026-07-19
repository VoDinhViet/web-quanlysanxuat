import { Link } from "@tanstack/react-router"
import { PackageOpen, Plus, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"

type ProductsEmptyStateProps = {
  /** True when a search/filter is active — the list is empty because nothing
   *  matched, not because no products exist yet. */
  isFiltered: boolean
}

export function ProductsEmptyState({ isFiltered }: ProductsEmptyStateProps) {
  const Icon = isFiltered ? SearchX : PackageOpen

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        <Icon className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {isFiltered
            ? "Không tìm thấy sản phẩm phù hợp"
            : "Chưa có sản phẩm nào"}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {isFiltered
            ? "Thử điều chỉnh từ khóa hoặc bộ lọc để xem thêm kết quả."
            : "Bắt đầu bằng cách thêm sản phẩm đầu tiên vào danh mục của bạn."}
        </p>
      </div>
      {!isFiltered ? (
        <PermissionGate permission="products:create">
          <Button asChild size="sm" className="text-xs">
            <Link to="/manage/products/create">
              <Plus className="size-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </PermissionGate>
      ) : null}
    </div>
  )
}
