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

export type SortOrder = "ASC" | "DESC"
