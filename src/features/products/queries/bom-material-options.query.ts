import { queryOptions } from "@tanstack/react-query"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getMaterials } from "@/lib/server-functions/get-materials"
import { MaterialStatus } from "@/lib/types/material.type"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Picker for the "add BOM item" dialog — materials, searched by the
// debounced `q` term (client-interactive, no loader prefetch). The full
// Material type lives in the materials feature, which products must not
// import from (CLAUDE.md), so the response is narrowed to {id, code, name}
// here. `getMaterials` (below) is shared with the materials list page, where
// a failed fetch must throw — but this picker is non-core, so it degrades to
// an empty list on failure instead.
export const bomMaterialOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "bom-material-options", q],
    queryFn: () =>
      getMaterials({
        data: {
          q: q || undefined,
          status: MaterialStatus.ACTIVE,
          limit: FILTER_OPTIONS_LIMIT,
        },
      })
        .then((response) =>
          response.data.map(({ id, code, name }) => ({ id, code, name }))
        )
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
