import { queryOptions } from "@tanstack/react-query"

import { getMaterials } from "@/features/materials/api/server-functions/get-materials.api"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"

export const materialsQueryOptions = (search: MaterialsSearchSchema) =>
  queryOptions({
    queryKey: ["materials", "list", search],
    queryFn: () => getMaterials({ data: search }),
  })
