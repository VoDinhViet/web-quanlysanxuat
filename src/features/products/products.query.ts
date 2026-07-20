import { queryOptions } from "@tanstack/react-query"

import { getClientOptions } from "@/features/products/server-functions/get-client-options"
import { getProduct } from "@/features/products/server-functions/get-product"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getProducts } from "@/features/products/server-functions/get-products"
import { getUnitOptions } from "@/features/products/server-functions/get-unit-options"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

// Reference lists (units, groups, clients) change rarely — cache them longer so
// moving between list/create/edit doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Query key convention (see .claude/rules/architecture.md): `["products"]` is the
// feature root, so `invalidateQueries({ queryKey: ["products"] })` after a write
// refreshes list + detail in one call.
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
    queryFn: () => getProductGroupFilterOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "unit-options"],
    queryFn: () => getUnitOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

// `q` is the combobox search term; the loader prefetches `q === ""` (initial
// page) and the combobox hook keys off the debounced term for later lookups.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "client-options", q],
    queryFn: () => getClientOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
