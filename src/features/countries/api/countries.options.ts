import { queryOptions } from "@tanstack/react-query"

import { getCountries } from "@/features/countries/api/server-functions/get-countries.api"
import { REFERENCE_STALE_TIME } from "@/lib/constants"

// `countries` has no UI of its own (no components/pages) — it's an api-only
// feature, same as units/operations: a reference resource used only by
// suppliers today, but master data that suppliers doesn't own.
export const countryOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["countries", "options"],
    queryFn: () => getCountries(),
    staleTime: REFERENCE_STALE_TIME,
  })
