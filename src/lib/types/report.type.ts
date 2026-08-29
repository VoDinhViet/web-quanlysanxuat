import type { ProductionJobStatus } from "@/lib/types/production-job.type"

/** Mirrors the backend's ReportStatsResDto (GET /api/reports/stats). All `*TrendCount`/
 *  `*TrendPercent`/`upcomingDueWindowDays` fields are null when a startDate/endDate filter is
 *  applied — comparing against "yesterday"/"last week" stops making sense for a picked range. */
export type ReportStats = {
  runningOrders: number
  runningOrdersTrendPercent: number | null
  orderDueDate: number
  orderDueDateTrendCount: number | null
  upcomingDueOrders: number
  upcomingDueWindowDays: number | null
  runningJobs: number
  runningJobsTrendCount: number | null
  jobsWaitingQc: number
  jobsWaitingQcTrendCount: number | null
  openNcr: number
  openNcrTrendCount: number | null
}

/** Mirrors the backend's ReportAlertsResDto (GET /api/reports/alerts) — no query params, no
 *  trend fields, always current counts for the "Cảnh báo quan trọng" dashboard cards. */
export type ReportAlerts = {
  jobDueDate: number
  outsourcingOrderDueDate: number
  openNcr: number
  upcomingDeliveries: number
}

/** Mirrors the backend's JobDueDateResDto (GET /api/reports/job-due-date) — top 5 Job trễ hạn
 *  nhất, sorted by dueDate ascending (nhiều ngày trễ nhất trước), no pagination, no filter.
 *  `dueDate` is never null here (the backend query excludes rows where it is). */
export type JobDueDate = {
  id: string
  code: string
  orderCode: string
  dueDate: string
  status: ProductionJobStatus
}

/** Mirrors the backend's OutsourcingOrderDueDateResDto (GET /api/reports/outsourcing-order-due-date)
 *  — top 5 OS-OUT trễ hạn nhất, sorted by expectedReturnDate ascending (nhiều ngày trễ nhất
 *  trước), no pagination, no filter. `expectedReturnDate` is never null here (the backend query
 *  excludes rows where it is). */
export type OutsourcingOrderDueDate = {
  id: string
  code: string
  supplierName: string
  expectedReturnDate: string
}

/** Mirrors the backend's OpenNcrResDto (GET /api/reports/open-ncr) — top 5 NCR chưa xử lý cũ nhất
 *  (createdAt tăng dần), no pagination, no filter. `status` chỉ phủ 2 giá trị "mở" thật sự xảy ra —
 *  PENDING (cả IQC/OQC), IN_PROGRESS (IQC: chờ trả NCC; OQC: đang rework — 2 giá trị cũ
 *  `WAITING_RETURN`/`REWORK` đã gộp 2026-08-29, `docs/decisions/quality-schema-rename.md` D2/D5 ở
 *  be-quanlysanxuat — `kind` là field duy nhất còn phân biệt được 2 trường hợp). */
export type OpenNcr = {
  id: string
  code: string
  kind: "INCOMING" | "OUTGOING"
  createdAt: string
  status: "PENDING" | "IN_PROGRESS"
}

/** Mirrors the backend's QcPassRateResDto (GET /api/reports/qc-pass-rate) — luôn đủ 7 điểm liên
 *  tiếp theo ngày (giờ VN), kể cả ngày không có lần kiểm nào. `iqcPassRate`/`oqcPassRate` là `null`
 *  cho ngày đó, không phải `0` — "chưa kiểm gì" khác "kiểm hết đều FAIL". */
export type QcPassRatePoint = {
  date: string
  iqcPassRate: number | null
  oqcPassRate: number | null
}

/** Mirrors the backend's ProductionProgressResDto (GET /api/reports/production-progress).
 *  `breakdown` is always exactly 5 entries, in ProductionJobStatus declaration order, even when
 *  a status has 0 jobs — the caller never needs to fill in missing statuses itself. */
export type ProductionProgress = {
  total: number
  breakdown: Array<{
    status: ProductionJobStatus
    count: number
    percent: number
  }>
}
