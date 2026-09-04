import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

type LocalPaginationProps = {
  pagination: Pagination
  limitOptions: readonly number[]
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  disabled?: boolean
  className?: string
}

// The compact "Trang X/Y — N kết quả" + limit select + prev/next pair a wizard's in-form picker
// uses — the sibling of `TablePagination` for pagination driven by local `useState`, not route
// search params (there's no URL to patch inside a create-wizard step). See
// CreateInventoryRequisitionPickerSection.tsx for a call site.
export function LocalPagination({
  pagination,
  limitOptions,
  onPageChange,
  onLimitChange,
  disabled,
  className,
}: LocalPaginationProps) {
  const { currentPage, limit, totalRecords, totalPages } = pagination

  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs text-muted-foreground",
        className
      )}
    >
      <span>
        Trang {currentPage}/{totalPages} — {totalRecords} kết quả
      </span>
      <div className="flex items-center gap-2">
        <Select
          selectedKey={String(limit)}
          onSelectionChange={(key) => onLimitChange(Number(key))}
          isDisabled={disabled}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((option) => (
              <SelectItem key={option} id={String(option)}>
                {option} / trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          isDisabled={disabled || currentPage <= 1}
          onPress={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          isDisabled={disabled || currentPage >= totalPages}
          onPress={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
