// Public surface for other features: the only thing another feature may
// import from `item-categories` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { itemCategoryOptionsQueryOptions } from "@/features/item-categories/api/options"
