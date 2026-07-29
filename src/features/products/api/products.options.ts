import { queryOptions } from "@tanstack/react-query"

import { getBomMaterials } from "@/features/products/api/server-functions/get-bom-materials.api"
import { getProductBom } from "@/features/products/api/server-functions/get-product-bom.api"
import { getProductGroups } from "@/features/products/api/server-functions/get-product-groups.api"
import { getProductOperations } from "@/features/products/api/server-functions/get-product-operations.api"
import { getProduct } from "@/features/products/api/server-functions/get-product.api"
import { getProducts } from "@/features/products/api/server-functions/get-products.api"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { REFERENCE_STALE_TIME } from "@/lib/constants"
import type { ProductStatus, ProductType } from "@/lib/types/product.type"

// Query key convention (see .claude/rules/architecture.md): `["products"]` is the
// feature root, so `invalidateQueries({ queryKey: ["products"] })` after a write
// refreshes list + detail + the options dropdown in one call.
export const productsQueryOptions = (search: ProductsSearchSchema) =>
  queryOptions({
    queryKey: ["products", "list", search],
    queryFn: () => getProducts({ data: search }),
  })

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProduct({ data: { productId } }),
  })

export const productGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "group-options"],
    queryFn: () => getProductGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })

// The BOM tree is scoped to the product, so it nests under the detail key —
// `invalidateQueries({ queryKey: ["products"] })` still covers it.
export const productBomQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId, "bom"],
    queryFn: () => getProductBom({ data: { productId } }),
  })

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

// The routing (Công đoạn) is scoped to the whole product, not to individual
// BOM lines — same nesting rationale as productBomQueryOptions.
export const productOperationsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId, "operations"],
    queryFn: () => getProductOperations({ data: { productId } }),
  })

type ProductOptionsFilter = {
  q: string
  type?: ProductType
  status?: ProductStatus
}

// Unified product-picker combobox, shared by this feature's own "add BOM
// item" dialog (fixing `type: WORK_IN_PROGRESS, status: ACTIVE` — only WIP
// products may be added as a structure node, backend rejects others, E053)
// and orders' order-line picker (no type/status filter, via this feature's
// `api` barrel — see .claude/rules/architecture.md's cross-feature import
// rule). Returns the full `Product`, not narrowed to {id,code,name}: orders'
// `OrderItemDialog` reads `unit`/`image` off the selected product, and each
// hook maps down to {value,label} itself. A failed fetch degrades to an
// empty list instead of taking down the whole picker.
export const productOptionsQueryOptions = (filter: ProductOptionsFilter) =>
  queryOptions({
    queryKey: ["products", "options", filter],
    queryFn: () =>
      getProducts({ data: { ...filter, limit: 100 } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
