// Public surface for other features: the only thing another feature may
// import from `production-jobs` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or `api/options/` directly.
export { useGetProductionJobOptions } from "@/features/production-jobs/api/use-get-production-job-options"
export { productionJobsQueryOptions } from "@/features/production-jobs/api/options/production-jobs.options"
export { productionJobQueryOptions } from "@/features/production-jobs/api/options/production-job.options"
export { productionJobOptionsQueryOptions } from "@/features/production-jobs/api/options/production-job-options.options"
// Đọc bởi production-execution — Part table của màn "Thực hiện sản xuất" gọi kèm `operationId`
// để lọc phía BE theo đúng công đoạn đang chọn, không cần route riêng.
export { productionJobOperationsQueryOptions } from "@/features/production-jobs/api/options/production-job-operations.options"
// Mutation hook, cố ý nằm trên public surface: dialog "Nhập báo cáo" đã lên
// `src/components/shared/composites/` vì CẢ HAI feature dùng chung (production-jobs' tab "Công
// đoạn sản xuất" và production-execution' màn "Thực hiện sản xuất"), nhưng entity nó ghi
// (`production_job_operations`) thuộc về feature này — shared UI gọi ngược qua barrel, đúng
// `qlsx/shared-reads-features-through-the-barrel` (eslint.config.js). Cùng khuôn `useLogout`
// (`@/features/auth/api`) đang được PageTitleBar.tsx dùng.
export { useCreateJobOperationReport } from "@/features/production-jobs/api/use-create-job-operation-report"
