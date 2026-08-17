import { useNavigate } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

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

export type PageLimit = 10 | 20 | 50

function getPageWindow(current: number, totalPages: number, size: number) {
  const windowSize = Math.min(size, totalPages)
  const start = Math.min(
    Math.max(1, current - Math.floor(windowSize / 2)),
    totalPages - windowSize + 1
  )

  return Array.from({ length: windowSize }, (_, index) => start + index)
}

type TablePaginationProps = {
  pagination: Pagination
  className?: string
}

// Updates the current route's `page`/`limit` search params in place, so any
// list route using Zod-validated pagination search params can drop it in.
export function TablePagination({
  pagination,
  className,
}: TablePaginationProps) {
  const navigate = useNavigate()
  const { currentPage, limit, totalRecords, totalPages } = pagination

  const handlePageChange = (page: number) => {
    void navigate({ to: ".", search: (prev) => ({ ...prev, page }) })
  }

  const handleLimitChange = (nextLimit: PageLimit) => {
    void navigate({
      to: ".",
      search: (prev) => ({ ...prev, limit: nextLimit, page: 1 }),
    })
  }
  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1
  const rangeEnd = Math.min(currentPage * limit, totalRecords)
  const pageWindow = getPageWindow(currentPage, totalPages, 4)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p>
        Hiển thị {rangeStart} đến {rangeEnd} trong tổng số {totalRecords} bản
        ghi
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <PaginationButton
            ariaLabel="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </PaginationButton>
          {pageWindow.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="icon-sm"
              className={cn(
                "text-xs font-medium",
                pageNumber !== currentPage && "bg-background text-foreground"
              )}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <PaginationButton
            ariaLabel="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </PaginationButton>
        </div>

        <Select
          value={String(limit)}
          onValueChange={(value) =>
            handleLimitChange(Number(value) as PageLimit)
          }
        >
          <SelectTrigger className="h-9 w-28 bg-background text-xs font-medium text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PaginationButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: {
  ariaLabel: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="bg-background text-foreground"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
