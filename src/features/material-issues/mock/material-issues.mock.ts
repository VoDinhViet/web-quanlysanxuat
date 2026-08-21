import type { MaterialIssue } from "@/lib/types/material-issue.type"
import { MaterialIssueStatus } from "@/lib/types/material-issue.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { MaterialIssuesSearchSchema } from "@/features/material-issues/schemas/material-issues-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — no backend route yet (see material-issue.type.ts's doc comment). The
// first 10 rows match the design mockup's screenshot exactly; the rest extend the same pattern
// so filtering/pagination has something real to chew on (24 rows → 3 pages at limit 10).
// ---------------------------------------------------------------------------

const departments = {
  hanTo1: { id: "dept-han-1", code: "TO-HAN-01", name: "Tổ Hàn 1" },
  hanTo2: { id: "dept-han-2", code: "TO-HAN-02", name: "Tổ Hàn 2" },
  coKhi: { id: "dept-co-khi", code: "TO-CK", name: "Tổ Cơ khí" },
  son: { id: "dept-son", code: "TO-SON", name: "Tổ Sơn" },
}

const users = {
  a: { id: "user-a", fullName: "Nguyễn Văn A" },
  b: { id: "user-b", fullName: "Trần Văn B" },
  c: { id: "user-c", fullName: "Phạm Văn C" },
  d: { id: "user-d", fullName: "Nguyễn Văn D" },
}

const mockRows: MaterialIssue[] = [
  {
    id: "lv-1",
    code: "LV2406-0012",
    issueDate: "2024-06-23T09:15:00",
    productionOrderCode: "PO2405-012",
    reason: null,
    job: { id: "job-8", code: "JOB2406-0008" },
    department: departments.hanTo1,
    creator: users.a,
    status: MaterialIssueStatus.PENDING_APPROVAL,
    note: "Lãnh thép tấm",
  },
  {
    id: "lv-2",
    code: "LV2406-0011",
    issueDate: "2024-06-23T08:45:00",
    productionOrderCode: "PO2405-012",
    reason: null,
    job: { id: "job-8", code: "JOB2406-0008" },
    department: departments.hanTo1,
    creator: users.b,
    status: MaterialIssueStatus.APPROVED,
    note: "Bu lông, ốc vít",
  },
  {
    id: "lv-3",
    code: "LV2406-0010",
    issueDate: "2024-06-22T16:20:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.c,
    status: MaterialIssueStatus.ISSUED,
    note: "Xuất lần 1",
  },
  {
    id: "lv-4",
    code: "LV2406-0009",
    issueDate: "2024-06-22T10:05:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.a,
    status: MaterialIssueStatus.ISSUED,
    note: "Thép, bản lề",
  },
  {
    id: "lv-5",
    code: "LV2406-0008",
    issueDate: "2024-06-21T15:40:00",
    productionOrderCode: "PO2405-010",
    reason: null,
    job: { id: "job-6", code: "JOB2406-0006" },
    department: departments.son,
    creator: users.b,
    status: MaterialIssueStatus.CANCELLED,
    note: "Hủy theo yêu cầu",
  },
  {
    id: "lv-6",
    code: "LV2406-0007",
    issueDate: "2024-06-21T09:30:00",
    productionOrderCode: "PO2405-011",
    reason: null,
    job: { id: "job-5", code: "JOB2406-0005" },
    department: departments.hanTo2,
    creator: users.c,
    status: MaterialIssueStatus.ISSUED,
    note: "Lần 2",
  },
  {
    id: "lv-7",
    code: "LV2406-0006",
    issueDate: "2024-06-20T14:10:00",
    productionOrderCode: "PO2405-009",
    reason: null,
    job: { id: "job-4", code: "JOB2406-0004" },
    department: departments.coKhi,
    creator: users.d,
    status: MaterialIssueStatus.PENDING_APPROVAL,
    note: "Lãnh vật tư cơ khí",
  },
  {
    id: "lv-8",
    code: "LV2406-0005",
    issueDate: "2024-06-20T08:05:00",
    productionOrderCode: "PO2405-008",
    reason: null,
    job: { id: "job-3", code: "JOB2406-0003" },
    department: departments.hanTo1,
    creator: users.b,
    status: MaterialIssueStatus.APPROVED,
    note: null,
  },
  {
    id: "lv-9",
    code: "LV2406-0004",
    issueDate: "2024-06-19T17:20:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.son,
    creator: users.a,
    status: MaterialIssueStatus.ISSUED,
    note: null,
  },
  {
    id: "lv-10",
    code: "LV2406-0003",
    issueDate: "2024-06-19T11:05:00",
    productionOrderCode: "PO2405-007",
    reason: null,
    job: { id: "job-1", code: "JOB2406-0001" },
    department: departments.coKhi,
    creator: users.c,
    status: MaterialIssueStatus.ISSUED,
    note: "Đủ vật tư",
  },
  {
    id: "lv-11",
    code: "LV2406-0002",
    issueDate: "2024-06-18T14:00:00",
    productionOrderCode: "PO2405-006",
    reason: null,
    job: { id: "job-7", code: "JOB2406-0007" },
    department: departments.hanTo2,
    creator: users.d,
    status: MaterialIssueStatus.ISSUED,
    note: "Đủ vật tư",
  },
  {
    id: "lv-12",
    code: "LV2406-0001",
    issueDate: "2024-06-18T08:30:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.c,
    status: MaterialIssueStatus.CANCELLED,
    note: "Hủy do trùng phiếu",
  },
  {
    id: "lv-13",
    code: "LV2405-0028",
    issueDate: "2024-06-17T16:45:00",
    productionOrderCode: "PO2405-005",
    reason: null,
    job: { id: "job-2405-12", code: "JOB2405-0012" },
    department: departments.son,
    creator: users.b,
    status: MaterialIssueStatus.ISSUED,
    note: null,
  },
  {
    id: "lv-14",
    code: "LV2405-0027",
    issueDate: "2024-06-17T09:10:00",
    productionOrderCode: "PO2405-004",
    reason: null,
    job: { id: "job-2405-11", code: "JOB2405-0011" },
    department: departments.hanTo1,
    creator: users.a,
    status: MaterialIssueStatus.PENDING_APPROVAL,
    note: "Lãnh sơn",
  },
  {
    id: "lv-15",
    code: "LV2405-0026",
    issueDate: "2024-06-16T15:00:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.d,
    status: MaterialIssueStatus.APPROVED,
    note: null,
  },
  {
    id: "lv-16",
    code: "LV2405-0025",
    issueDate: "2024-06-16T10:20:00",
    productionOrderCode: "PO2405-003",
    reason: null,
    job: { id: "job-2405-10", code: "JOB2405-0010" },
    department: departments.hanTo2,
    creator: users.b,
    status: MaterialIssueStatus.ISSUED,
    note: "Lần 1",
  },
  {
    id: "lv-17",
    code: "LV2405-0024",
    issueDate: "2024-06-15T14:35:00",
    productionOrderCode: "PO2405-002",
    reason: null,
    job: { id: "job-2405-09", code: "JOB2405-0009" },
    department: departments.coKhi,
    creator: users.c,
    status: MaterialIssueStatus.ISSUED,
    note: null,
  },
  {
    id: "lv-18",
    code: "LV2405-0023",
    issueDate: "2024-06-15T08:50:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.son,
    creator: users.a,
    status: MaterialIssueStatus.CANCELLED,
    note: "Hủy theo yêu cầu KH",
  },
  {
    id: "lv-19",
    code: "LV2405-0022",
    issueDate: "2024-06-14T16:15:00",
    productionOrderCode: "PO2405-001",
    reason: null,
    job: { id: "job-2405-08", code: "JOB2405-0008" },
    department: departments.hanTo1,
    creator: users.d,
    status: MaterialIssueStatus.PENDING_APPROVAL,
    note: null,
  },
  {
    id: "lv-20",
    code: "LV2405-0021",
    issueDate: "2024-06-14T09:40:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.b,
    status: MaterialIssueStatus.ISSUED,
    note: "Xuất bổ sung",
  },
  {
    id: "lv-21",
    code: "LV2405-0020",
    issueDate: "2024-06-13T15:25:00",
    productionOrderCode: "PO2404-018",
    reason: null,
    job: { id: "job-2405-07", code: "JOB2405-0007" },
    department: departments.hanTo2,
    creator: users.c,
    status: MaterialIssueStatus.APPROVED,
    note: null,
  },
  {
    id: "lv-22",
    code: "LV2405-0019",
    issueDate: "2024-06-13T10:05:00",
    productionOrderCode: "PO2404-017",
    reason: null,
    job: { id: "job-2405-06", code: "JOB2405-0006" },
    department: departments.son,
    creator: users.a,
    status: MaterialIssueStatus.ISSUED,
    note: "Lần 2",
  },
  {
    id: "lv-23",
    code: "LV2405-0018",
    issueDate: "2024-06-12T14:50:00",
    productionOrderCode: null,
    reason: "Sản xuất nội bộ",
    job: null,
    department: departments.coKhi,
    creator: users.d,
    status: MaterialIssueStatus.ISSUED,
    note: null,
  },
  {
    id: "lv-24",
    code: "LV2405-0017",
    issueDate: "2024-06-12T08:15:00",
    productionOrderCode: "PO2404-016",
    reason: null,
    job: { id: "job-2405-05", code: "JOB2405-0005" },
    department: departments.hanTo1,
    creator: users.b,
    status: MaterialIssueStatus.CANCELLED,
    note: "Hủy do sai vật tư",
  },
]

// Bộ phận cho select filter — suy trực tiếp từ `mockRows` (qua `departments` ở trên) để không
// lệch dữ liệu, thay vì khai một danh sách rời có thể trôi khỏi các dòng thật.
export const mockDepartmentOptions = Object.values(departments).map(
  (department) => ({ value: department.id, label: department.name })
)

export function getMockMaterialIssues(
  search: MaterialIssuesSearchSchema
): PaginatedResponse<MaterialIssue> {
  let rows = [...mockRows]

  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        (r.reason?.toLowerCase().includes(q) ?? false) ||
        (r.job?.code.toLowerCase().includes(q) ?? false) ||
        (r.note?.toLowerCase().includes(q) ?? false)
    )
  }

  if (search.code) {
    const code = search.code.toLowerCase()
    rows = rows.filter((r) => r.code.toLowerCase().includes(code))
  }

  if (search.reason) {
    const reason = search.reason.toLowerCase()
    rows = rows.filter(
      (r) =>
        (r.productionOrderCode?.toLowerCase().includes(reason) ?? false) ||
        (r.reason?.toLowerCase().includes(reason) ?? false)
    )
  }

  if (search.jobCode) {
    const jobCode = search.jobCode.toLowerCase()
    rows = rows.filter((r) => r.job?.code.toLowerCase().includes(jobCode))
  }

  if (search.departmentId) {
    rows = rows.filter((r) => r.department.id === search.departmentId)
  }

  if (search.status) {
    rows = rows.filter((r) => r.status === search.status)
  }

  const totalRecords = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / search.limit))
  const currentPage = Math.min(search.page, totalPages)
  const offset = (currentPage - 1) * search.limit
  const data = rows.slice(offset, offset + search.limit)

  return {
    data,
    pagination: {
      currentPage,
      limit: search.limit,
      totalRecords,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    },
  }
}
