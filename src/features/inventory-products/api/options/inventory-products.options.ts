import { queryOptions } from "@tanstack/react-query"

import {
  getMockInventoryProduct,
  getMockInventoryProducts,
} from "@/features/inventory-products/mock/inventory-products.mock"
import type { InventoryProduct } from "@/lib/types/inventory-product.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { InventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

export const inventoryProductsQueryOptions = (
  search: InventoryProductsSearchSchema
) =>
  queryOptions<PaginatedResponse<InventoryProduct>>({
    queryKey: ["inventory-products", "list", search],
    queryFn: () =>
      new Promise<PaginatedResponse<InventoryProduct>>((resolve) =>
        setTimeout(() => resolve(getMockInventoryProducts(search)), 120)
      ),
  })

export const inventoryProductQueryOptions = (id: string) =>
  queryOptions<InventoryProduct>({
    queryKey: ["inventory-products", "detail", id],
    queryFn: () =>
      new Promise<InventoryProduct>((resolve, reject) =>
        setTimeout(() => {
          const detail = getMockInventoryProduct(id)
          if (!detail) {
            reject(new Error("Không tìm thấy thông tin tồn kho thành phẩm."))
          } else {
            resolve(detail)
          }
        }, 120)
      ),
  })
