import { queryOptions } from "@tanstack/react-query"

import { getMaterials } from "@/features/materials/api/server-functions/get-materials.api"
import { MaterialStatus } from "@/lib/types/material.type"

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
    staleTime: 5 * 60_000,
  })
