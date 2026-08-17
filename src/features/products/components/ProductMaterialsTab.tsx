import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { ProductMaterialsTable } from "@/features/products/components/ProductMaterialsTable"
import { ProductMaterialsTableFilter } from "@/features/products/components/ProductMaterialsTableFilter"
import { bomMaterialsQueryOptions } from "@/features/products/api/options"
import type { Item } from "@/lib/types/item.type"

type ProductMaterialsTabProps = {
  product: Item
}

const defaultPage = 1
const defaultLimit = 10

export function ProductMaterialsTab({ product }: ProductMaterialsTabProps) {
  const search = useSearch({ from: "/(authed)/manage_/products_/$productId" })
  const navigate = useNavigate({ from: "/manage/products/$productId" })

  const page = search.page ?? defaultPage
  const limit = search.limit ?? defaultLimit

  const materialsQuery = useQuery(
    bomMaterialsQueryOptions(product.id, { page, limit, q: search.q })
  )

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: defaultPage }),
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
