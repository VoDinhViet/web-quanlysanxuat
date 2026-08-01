import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { ProductMaterialsTable } from "@/features/products/components/ProductMaterialsTable"
import { ProductMaterialsTableFilter } from "@/features/products/components/ProductMaterialsTableFilter"
import { bomMaterialsQueryOptions } from "@/features/products/api/products.options"
import type { Product } from "@/lib/types/product.type"

type ProductMaterialsTabProps = {
  product: Product
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export function ProductMaterialsTab({ product }: ProductMaterialsTabProps) {
  const search = useSearch({ from: "/(authed)/manage_/products_/$productId" })
  const navigate = useNavigate({ from: "/manage/products/$productId" })

  const page = search.page ?? DEFAULT_PAGE
  const limit = search.limit ?? DEFAULT_LIMIT

  const materialsQuery = useQuery(
    bomMaterialsQueryOptions(product.id, { page, limit, q: search.q })
  )

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: DEFAULT_PAGE }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductMaterialsTableFilter
        q={search.q}
        onSearchChange={handleSearchChange}
      />

      {materialsQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : materialsQuery.isError ? (
        <TableQueryError
          error={materialsQuery.error.message}
          onRetry={() => void materialsQuery.refetch()}
        />
      ) : (
        <ProductMaterialsTable
          rows={materialsQuery.data.data}
          pagination={materialsQuery.data.pagination}
          isPending={materialsQuery.isFetching}
        />
      )}
    </div>
  )
}
