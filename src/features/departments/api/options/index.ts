// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["departments"]` is the feature root.
export { departmentQueryOptions } from "@/features/departments/api/options/department-options.options"
