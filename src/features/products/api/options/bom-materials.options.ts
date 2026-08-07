import { queryOptions } from "@tanstack/react-query"

import { getBomMaterials } from "@/features/products/api/server-functions/get-bom-materials.api"

type BomMaterialsSearch = {
  page?: number
  limit?: number
  q?: string
}

// Scoped to the item, so it nests under the detail key like itemBomQueryOptions —
// `invalidateQueries({ queryKey: ["items"] })` still covers it.
export const bomMaterialsQueryOptions = (
  itemId: string,
  search: BomMaterialsSearch
) =>
  queryOptions({
    queryKey: ["items", "detail", itemId, "bom-materials", search],
    queryFn: () => getBomMaterials({ data: { itemId, ...search } }),
  })
