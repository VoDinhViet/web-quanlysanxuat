import { queryOptions } from "@tanstack/react-query"

import { getBomMaterials } from "@/features/products/server-functions/get-bom-materials"

export type BomMaterialsSearch = {
  page?: number
  limit?: number
  q?: string
}

// Scoped to the product, so it nests under the detail key like productBomQueryOptions —
// `invalidateQueries({ queryKey: ["products"] })` still covers it.
export const bomMaterialsQueryOptions = (
  productId: string,
  search: BomMaterialsSearch
) =>
  queryOptions({
    queryKey: ["products", "detail", productId, "bom-materials", search],
    queryFn: () => getBomMaterials({ data: { productId, ...search } }),
  })
