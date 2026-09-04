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

const pageSizeOptions = [10, 20, 50] as const
export type PageSize = (typeof pageSizeOptions)[number]

function getPageWindow(current: number, totalPages: number, size: number) {
  const windowSize = Math.min(size, totalPages)
  const start = Math.min(
    Math.max(1, current - Math.floor(windowSize / 2)),
    totalPages - windowSize + 1
  )

  return Array.from({ length: windowSize }, (_, index) => start + index)
}

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  // Omit entirely to render without a page-size selector (a fixed-page-size feed/dialog) —
  // not a separate boolean flag.
  onPageSizeChange?: (pageSize: PageSize) => void
  disabled?: boolean
  className?: string
  // DOM node to portal the page-size Select's popup into — forwarded as
  // `UNSTABLE_portalContainer`, same defensive purpose as ComboboxField's own `container` prop.
  // Pass the enclosing Dialog's content node when this pagination is rendered inside one —
  // default undefined, everything else portals to `<body>` as normal.
  container?: HTMLElement | null
}

// The one pagination control every table/list/feed in the app renders — page-number buttons +
// prev/next, an optional page-size selector, route-agnostic (the caller supplies
// onPageChange/onPageSizeChange, whether that means patching a route search param via
// useRoutePagination or updating local state).
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  disabled,
  className,
  container,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const pageWindow = getPageWindow(page, totalPages, 4)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p>
        Hiển thị {rangeStart} đến {rangeEnd} trong tổng số {total} bản ghi
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <PaginationButton
            ariaLabel="Trang trước"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </PaginationButton>
          {pageWindow.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? "default" : "outline"}
              size="icon-sm"
              className={cn(
                "text-xs font-medium",
                pageNumber !== page && "bg-background text-foreground"
              )}
              isDisabled={disabled}
              onPress={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <PaginationButton
            ariaLabel="Trang sau"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </PaginationButton>
        </div>

        {onPageSizeChange && (
          <Select
            value={String(pageSize)}
            onChange={(key) => onPageSizeChange(Number(key) as PageSize)}
            isDisabled={disabled}
          >
            <SelectTrigger className="h-9 w-28 bg-background text-xs font-medium text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent UNSTABLE_portalContainer={container ?? undefined}>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} id={String(option)}>
                  {option} / trang
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
      isDisabled={disabled}
      onPress={onClick}
    >
      {children}
    </Button>
  )
}
