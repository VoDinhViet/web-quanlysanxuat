import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router"
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
import { PageTitleBar } from "@/components/shared/page-title-bar"
import { UsersTable } from "@/features/users/components/users-table"
import { UsersTableFilter } from "@/features/users/components/users-table-filter"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { cn } from "@/lib/utils"
import type { Pagination } from "@/lib/types/pagination.type"

export function UsersPage() {
  // useSearch/useLoaderData key off the file-based route id; useNavigate's `from`
  // keys off the resolved URL path instead — the two intentionally differ.
  const search = useSearch({ from: "/(authed)/manage_/users" })
  const usersResult = useLoaderData({ from: "/(authed)/manage_/users" })
  const navigate = useNavigate({ from: "/manage/users" })

  const handleFilterChange = (patch: Partial<UsersSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
  }

  const handlePageChange = (page: number) => {
    void navigate({ search: (prev) => ({ ...prev, page }) })
  }

  const handleLimitChange = (limit: UsersSearchSchema["limit"]) => {
    void navigate({ search: (prev) => ({ ...prev, limit, page: 1 }) })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Nhân sự" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-8.5rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <UsersTableFilter
                search={search}
                onFilterChange={handleFilterChange}
              />

              <UsersTable rows={usersResult.data} />
              <TablePagination
                pagination={usersResult.pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

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
  onPageChange: (page: number) => void
  onLimitChange: (limit: UsersSearchSchema["limit"]) => void
}

function TablePagination({
  pagination,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  const { currentPage, limit, totalRecords, totalPages } = pagination
  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1
  const rangeEnd = Math.min(currentPage * limit, totalRecords)
  const pageWindow = getPageWindow(currentPage, totalPages, 4)

  return (
    <div className="flex flex-col gap-3 px-4 py-4 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-5">
      <p>
        Hiển thị {rangeStart} đến {rangeEnd} trong tổng số {totalRecords} nhân
        sự
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <PaginationButton
            ariaLabel="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <PaginationButton
            ariaLabel="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </PaginationButton>
        </div>

        <Select
          value={String(limit)}
          onValueChange={(value) =>
            onLimitChange(Number(value) as UsersSearchSchema["limit"])
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
