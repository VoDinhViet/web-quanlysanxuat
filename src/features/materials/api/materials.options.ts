import { queryOptions } from "@tanstack/react-query"

import { getMaterial } from "@/features/materials/api/server-functions/get-material.api"
import { getMaterialGroups } from "@/features/materials/api/server-functions/get-material-groups.api"
import { getMaterials } from "@/features/materials/api/server-functions/get-materials.api"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { REFERENCE_STALE_TIME } from "@/lib/constants"
import { MaterialStatus } from "@/lib/types/material.type"

// Query key convention (see .claude/rules/architecture.md): `["materials"]` is
// the feature root, so `invalidateQueries({ queryKey: ["materials"] })` after a
// write refreshes list + detail + the options dropdown in one call.
export const materialsQueryOptions = (search: MaterialsSearchSchema) =>
  queryOptions({
    queryKey: ["materials", "list", search],
    queryFn: () => getMaterials({ data: search }),
  })

export const materialQueryOptions = (materialId: string) =>
  queryOptions({
    queryKey: ["materials", "detail", materialId],
    queryFn: () => getMaterial({ data: { materialId } }),
  })

export const materialGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["materials", "group-options"],
    queryFn: () => getMaterialGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })

// Picker for the "add BOM item" dialog (products feature, via this feature's
// `api` barrel) — materials, searched by the debounced `q` term. Narrowed to
// {id, code, name} rather than the full `Material` type, which products must
// not import from (CLAUDE.md). `getMaterials` (above) is shared with this
// feature's own list page, where a failed fetch must throw — but this picker
// is non-core, so it degrades to an empty list on failure instead.
export const materialOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["materials", "options", q],
    queryFn: () =>
      getMaterials({
        data: { q, status: MaterialStatus.ACTIVE, limit: 100 },
      })
        .then((response) =>
          response.data.map(({ id, code, name }) => ({ id, code, name }))
        )
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
