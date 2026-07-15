// Mirrors the backend pagination envelope shared by all list endpoints.
export type Pagination = {
  limit: number
  currentPage: number
  nextPage: number | null
  previousPage: number | null
  totalRecords: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: Pagination
}

// Shared sort direction for list endpoints — reused by z.enum in feature schemas.
export const SORT_ORDERS = ["ASC", "DESC"] as const
export type SortOrder = (typeof SORT_ORDERS)[number]
