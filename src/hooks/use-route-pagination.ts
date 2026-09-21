import { useNavigate } from "@tanstack/react-router"
import type { PageSize } from "@/components/shared/composites/Pagination"

// Binds Pagination's onPageChange/onPageSizeChange to the current route's page/limit search
// params — the route-driven counterpart every list-page table needs, factored out of the old
// TablePagination component now that Pagination itself is a pure presentational prop-driven
// component. See ClientsTable.tsx for a call site.
export function useRoutePagination() {
  const navigate = useNavigate()

  return {
    onPageChange: (page: number) => {
      void navigate({ to: ".", search: (prev) => ({ ...prev, page }) })
    },
    onPageSizeChange: (pageSize: PageSize) => {
      void navigate({
        to: ".",
        search: (prev) => ({ ...prev, limit: pageSize, page: 1 }),
      })
    },
  }
}
