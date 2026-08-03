// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["countries"]` is the feature root.
export { countryOptionsQueryOptions } from "@/features/countries/api/options/country-options.options"
