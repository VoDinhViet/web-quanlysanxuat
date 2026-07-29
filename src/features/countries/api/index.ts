// Public surface for other features: the only thing another feature may
// import from `countries` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { countryOptionsQueryOptions } from "@/features/countries/api/countries.options"
