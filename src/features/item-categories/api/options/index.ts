// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["item-categories"]` is the feature root.
export { itemCategoriesQueryOptions } from "@/features/item-categories/api/options/item-categories.options"
export { itemCategoryOptionsQueryOptions } from "@/features/item-categories/api/options/item-category-options.options"
