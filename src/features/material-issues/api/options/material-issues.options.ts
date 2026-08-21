import { queryOptions } from "@tanstack/react-query"

import { getMockMaterialIssues } from "@/features/material-issues/mock/material-issues.mock"
import type { MaterialIssuesSearchSchema } from "@/features/material-issues/schemas/material-issues-search.schema"
import type { MaterialIssue } from "@/lib/types/material-issue.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// Mock-backed for now (see material-issue.type.ts's doc comment) — this `queryFn` is the one
// spot to swap for a real server function once the backend gets an approval-flow route; the
// query key/shape below already matches what a real `getMaterialIssues` server function would
// return, so no caller needs to change.
export const materialIssuesQueryOptions = (
  search: MaterialIssuesSearchSchema
) =>
  queryOptions<PaginatedResponse<MaterialIssue>>({
    queryKey: ["material-issues", "list", search],
    queryFn: () =>
      new Promise<PaginatedResponse<MaterialIssue>>((resolve) =>
        setTimeout(() => resolve(getMockMaterialIssues(search)), 120)
      ),
  })
