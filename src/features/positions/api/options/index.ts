// `positions` has no UI of its own (no components/pages) — it's an api-only feature, same as
// units/operations/countries: a reference resource with more than one consumer (the department
// detail page's position table, the user form's dependent select). Position create/update/
// delete are owned by `departments` instead, since that's the screen they're edited from — see
// "Layer boundaries" in architecture.md.
export { positionOptionsQueryOptions } from "@/features/positions/api/options/position-options.options"
