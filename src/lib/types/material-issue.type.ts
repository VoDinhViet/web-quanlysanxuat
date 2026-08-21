/** "Lãnh vật tư" list screen (`/manage/material-issues`) — a **mock-only** shape, no backing
 *  backend DTO yet. Closest real resource once wired up: `inventory_issues` with
 *  `issueType = PRODUCTION` (`src/api/inventory-issues/`, mirrored on the FE in
 *  `src/lib/types/inventory-issue.type.ts`) — same header/line shape, `productionOrder`/
 *  `productionJob`/`department`/`requesterBy`/`note`/`items`. The two approval statuses below
 *  (`PENDING_APPROVAL`/`APPROVED`) have no backend equivalent: the real lifecycle is a one-way
 *  `DRAFT → POSTED`/`CANCELLED` with no approval step, so this pass renders the design as-is on
 *  mock data and defers the approval-flow mismatch to whenever the backend adds one. */
export const MaterialIssueStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  ISSUED: "ISSUED",
  CANCELLED: "CANCELLED",
} as const

export type MaterialIssueStatus =
  (typeof MaterialIssueStatus)[keyof typeof MaterialIssueStatus]

export const materialIssueStatusLabels: Record<MaterialIssueStatus, string> = {
  [MaterialIssueStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [MaterialIssueStatus.APPROVED]: "Đã duyệt",
  [MaterialIssueStatus.ISSUED]: "Đã xuất",
  [MaterialIssueStatus.CANCELLED]: "Đã hủy",
}

export const materialIssueStatusDescriptions: Record<
  MaterialIssueStatus,
  string
> = {
  [MaterialIssueStatus.PENDING_APPROVAL]:
    "Phiếu chờ người có thẩm quyền duyệt.",
  [MaterialIssueStatus.APPROVED]: "Phiếu đã được duyệt, chờ kho xuất.",
  [MaterialIssueStatus.ISSUED]: "Phiếu đã xuất kho một phần hoặc toàn bộ.",
  [MaterialIssueStatus.CANCELLED]: "Phiếu đã bị hủy trước khi xuất.",
}

export type MaterialIssueJobRef = {
  id: string
  code: string
}

export type MaterialIssueDepartmentRef = {
  id: string
  code: string
  name: string
}

export type MaterialIssueUserRef = {
  id: string
  fullName: string
}

/** One row of the "Lãnh vật tư" list — see the file doc comment for the mock/real-DTO gap. */
export type MaterialIssue = {
  id: string
  code: string
  issueDate: string
  // Cột "PO / Lý do": ưu tiên hiện mã PO (`productionOrderCode`) khi có, ngược lại hiện lý do
  // tự do (`reason`, vd "Sản xuất nội bộ") — hai field tách rời, không phải cùng một chuỗi, vì
  // khi ghép API thật `productionOrderCode` map từ `inventory_issues.productionOrder.code`.
  productionOrderCode: string | null
  reason: string | null
  job: MaterialIssueJobRef | null
  department: MaterialIssueDepartmentRef
  creator: MaterialIssueUserRef
  status: MaterialIssueStatus
  note: string | null
}
