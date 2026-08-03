// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["products"]` is the feature root, so
// `invalidateQueries({ queryKey: ["products"] })` after a write refreshes list + detail + the
// options dropdown in one call.
export { productsQueryOptions } from "@/features/products/api/options/products.options"
export { productQueryOptions } from "@/features/products/api/options/product.options"
export { productGroupOptionsQueryOptions } from "@/features/products/api/options/product-group-options.options"
export { productBomQueryOptions } from "@/features/products/api/options/product-bom.options"
export { bomMaterialsQueryOptions } from "@/features/products/api/options/bom-materials.options"
export { productOperationsQueryOptions } from "@/features/products/api/options/product-operations.options"
export { productOptionsQueryOptions } from "@/features/products/api/options/product-options.options"
export { orderProductOptionsQueryOptions } from "@/features/products/api/options/order-product-options.options"
