// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["production-jobs"]` is the feature root, so
// `invalidateQueries({ queryKey: ["production-jobs"] })` refreshes the whole feature.
export { productionJobsQueryOptions } from "@/features/production-jobs/api/options/production-jobs.options"
export { productionJobQueryOptions } from "@/features/production-jobs/api/options/production-job.options"
export { productionJobBomQueryOptions } from "@/features/production-jobs/api/options/production-job-bom.options"
export { productionJobMaterialsQueryOptions } from "@/features/production-jobs/api/options/production-job-materials.options"
export { productionJobAttachmentsQueryOptions } from "@/features/production-jobs/api/options/production-job-attachments.options"
export {
  productionJobNotesPageLimit,
  productionJobNotesQueryOptions,
} from "@/features/production-jobs/api/options/production-job-notes.options"
