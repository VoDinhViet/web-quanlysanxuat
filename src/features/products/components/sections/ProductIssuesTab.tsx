import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { ProductIssuesTable } from "@/features/products/components/composites/ProductIssuesTable"
import { ProductIssuesTableFilter } from "@/features/products/components/sections/ProductIssuesTableFilter"
import { itemIssuesQueryOptions } from "@/features/products/api/options"
import type { Item } from "@/lib/types/item.type"

type ProductIssuesTabProps = {
  product: Item
}

const defaultPage = 1
const defaultLimit = 10

export function ProductIssuesTab({ product }: ProductIssuesTabProps) {
  const search = useSearch({ from: "/(authed)/manage_/products_/$productId" })
  const navigate = useNavigate({ from: "/manage/products/$productId" })

  const page = search.page ?? defaultPage
  const limit = search.limit ?? defaultLimit

  const directsQuery = useQuery(
    itemIssuesQueryOptions(product.id, { page, limit, q: search.q })
  )

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: defaultPage }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductIssuesTableFilter
        q={search.q}
        onSearchChange={handleSearchChange}
      />

      {directsQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : directsQuery.isError ? (
        <TableQueryError
          error={directsQuery.error.message}
          onRetry={() => void directsQuery.refetch()}
        />
      ) : (
        <ProductIssuesTable
          rows={directsQuery.data.data}
          pagination={directsQuery.data.pagination}
          isPending={directsQuery.isFetching}
        />
      )}
    </div>
  )
}
