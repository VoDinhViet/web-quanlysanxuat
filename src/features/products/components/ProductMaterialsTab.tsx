import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { ClipboardList } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { DataTable } from "@/components/shared/DataTable"
import { bomMaterialColumns } from "@/features/products/components/ProductMaterialsTableColumns"
import { ProductMaterialsTableFilter } from "@/features/products/components/ProductMaterialsTableFilter"
import { bomMaterialsQueryOptions } from "@/features/products/api/options"
import type { Item } from "@/lib/types/item.type"

type ProductMaterialsTabProps = {
  product: Item
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
        <DataTable
          rows={materialsQuery.data.data}
          columns={bomMaterialColumns}
          pagination={materialsQuery.data.pagination}
          isPending={materialsQuery.isFetching}
          emptyState={
            <TableEmptyState
              icon={ClipboardList}
              title="Chưa có vật tư nào"
              description='Thêm vật tư vào cấu trúc sản phẩm ở tab "Cấu trúc & Công đoạn" để hiển thị tại đây.'
            />
          }
        />
      )}
    </div>
  )
}
