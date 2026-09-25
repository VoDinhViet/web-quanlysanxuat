import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { unitsQueryOptions } from "@/features/units/api/options"
import { UnitsPage } from "@/features/units/pages/UnitsPage"
import { unitsSearchSchema } from "@/features/units/schemas/units-search.schema"

export const Route = createFileRoute("/(authed)/manage_/settings/units")({
  validateSearch: unitsSearchSchema,
  loader: ({ context, location }) => {
    return context.queryClient.query({
      ...unitsQueryOptions(unitsSearchSchema.parse(location.search)),
      staleTime: "static",
    })
  },
  component: UnitsPage,
  pendingComponent: PagePending,
})
