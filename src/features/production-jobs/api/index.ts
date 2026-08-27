// Public surface for other features: the only thing another feature may
// import from `production-jobs` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or `api/options/` directly.
export { useGetProductionJobOptions } from "@/features/production-jobs/api/use-get-production-job-options"
export { productionJobsQueryOptions } from "@/features/production-jobs/api/options/production-jobs.options"
export { productionJobQueryOptions } from "@/features/production-jobs/api/options/production-job.options"
export { productionJobOptionsQueryOptions } from "@/features/production-jobs/api/options/production-job-options.options"
// Đọc bởi production-execution — Part table của màn "Thực hiện sản xuất" (C1 trong kế hoạch)
// lọc lại chính danh sách này theo operationId đang chọn, không cần route riêng.
export { productionJobOperationsQueryOptions } from "@/features/production-jobs/api/options/production-job-operations.options"
