import { queryOptions } from "@tanstack/react-query"

import { getMaterial } from "@/features/materials/api/server-functions/get-material.api"

export const materialQueryOptions = (materialId: string) =>
  queryOptions({
    queryKey: ["materials", "detail", materialId],
    queryFn: () => getMaterial({ data: { materialId } }),
  })
