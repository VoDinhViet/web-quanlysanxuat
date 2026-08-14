import type {
  PaymentRequest,
  PaymentRequestDetail,
  PaymentRequestStatus,
} from "@/lib/types/payment-request.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { PaymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — replace this entire file when the real API is available.
// All values match the screenshot (YCTT2406-001 … 005).
// ---------------------------------------------------------------------------

const MOCK_ROWS: PaymentRequest[] = [
  {
    id: "pr-1",
    code: "YCTT2406-001",
    purchaseOrder: { id: "po-12", code: "PO2405-012", orderDate: "2024-05-15" },
    supplier: {
      id: "s-1",
      name: "Viettel Construction",
      address: "Số 1 Giang Văn Minh, Ba Đình, Hà Nội",
      phoneNumber: "024 6287 1234",
      email: "contact@viettelconstruction.vn",
    },
    poValue: 125_000_000,
    requestValue: 125_000_000,
    status: "PENDING",
    createdAt: "2024-06-23T09:15:00.000Z",
  },
  {
    id: "pr-2",
    code: "YCTT2406-002",
    purchaseOrder: { id: "po-11", code: "PO2405-011", orderDate: "2024-05-10" },
    supplier: {
      id: "s-2",
      name: "Thaco Industries",
      address: "12 Nguyễn Văn Cừ, Hải Châu, Đà Nẵng",
      phoneNumber: "0236 123 4567",
      email: "procurement@thaco.vn",
    },
    poValue: 78_650_000,
    requestValue: 78_650_000,
    status: "PAID",
    createdAt: "2024-06-22T14:30:00.000Z",
  },
  {
    id: "pr-3",
    code: "YCTT2406-003",
    purchaseOrder: { id: "po-10", code: "PO2405-010", orderDate: "2024-05-08" },
    supplier: {
      id: "s-3",
      name: "Hoà Phát Steel",
      address: "Km2, Quốc lộ 5, Hải Dương",
      phoneNumber: "0220 395 0000",
      email: "sales@hoaphat.vn",
    },
    poValue: 56_320_000,
    requestValue: 56_320_000,
    status: "PAID",
    createdAt: "2024-06-20T10:05:00.000Z",
  },
  {
    id: "pr-4",
    code: "YCTT2406-004",
    purchaseOrder: { id: "po-9", code: "PO2405-009", orderDate: "2024-05-05" },
    supplier: {
      id: "s-4",
      name: "VinFast",
      address: "Khu kinh tế Đình Vũ, Hải Phòng",
      phoneNumber: "1900 232389",
      email: "supplier@vinfast.vn",
    },
    poValue: 210_000_000,
    requestValue: 210_000_000,
    status: "PENDING",
    createdAt: "2024-06-19T16:20:00.000Z",
  },
  {
    id: "pr-5",
    code: "YCTT2406-005",
    purchaseOrder: { id: "po-8", code: "PO2405-008", orderDate: "2024-05-03" },
    supplier: {
      id: "s-5",
      name: "Samsung SDV",
      address: "Yên Phong, Bắc Ninh",
      phoneNumber: "0222 123 0000",
      email: "purchase@samsung-sdv.vn",
    },
    poValue: 98_700_000,
    requestValue: 98_700_000,
    status: "PENDING",
    createdAt: "2024-06-18T08:40:00.000Z",
  },
]

const MOCK_DETAILS: Record<string, PaymentRequestDetail> = {
  "pr-1": {
    ...MOCK_ROWS[0],
    note: null,
    createdBy: "Nguyễn Văn A",
    items: [
      {
        id: "item-1",
        materialCode: "VT-001",
        materialName: "Thép tấm SS400 dày 5mm",
        unit: "kg",
        orderedQty: 1000,
        receivedQty: 1000,
        unitPrice: 18_000,
        lineTotal: 18_000_000,
      },
      {
        id: "item-2",
        materialCode: "VT-002",
        materialName: "Thép tấm SS400 dày 8mm",
        unit: "kg",
        orderedQty: 800,
        receivedQty: 800,
        unitPrice: 19_500,
        lineTotal: 15_600_000,
      },
      {
        id: "item-3",
        materialCode: "VT-003",
        materialName: "Sơn chống rỉ Jotun",
        unit: "lít",
        orderedQty: 100,
        receivedQty: 100,
        unitPrice: 220_000,
        lineTotal: 22_000_000,
      },
      {
        id: "item-4",
        materialCode: "VT-004",
        materialName: "Bulon M16 x 60",
        unit: "cái",
        orderedQty: 1000,
        receivedQty: 1000,
        unitPrice: 4_500,
        lineTotal: 4_500_000,
      },
      {
        id: "item-5",
        materialCode: "VT-005",
        materialName: "Đai ốc M16",
        unit: "cái",
        orderedQty: 1000,
        receivedQty: 1000,
        unitPrice: 2_800,
        lineTotal: 2_800_000,
      },
    ],
    statusHistory: [
      {
        status: "PENDING",
        changedAt: "2024-06-23T09:15:00.000Z",
        changedBy: "Nguyễn Văn A (Thu mua)",
      },
      {
        status: "PAID",
        changedAt: "",
        changedBy: null,
      },
    ],
  },
}

// Build a fallback detail for rows that don't have a handcrafted MOCK_DETAILS entry.
function buildFallbackDetail(row: PaymentRequest): PaymentRequestDetail {
  return {
    ...row,
    note: null,
    createdBy: "Admin",
    items: [
      {
        id: "item-generic-1",
        materialCode: "VT-001",
        materialName: "Vật tư mẫu",
        unit: "cái",
        orderedQty: 100,
        receivedQty: 100,
        unitPrice: row.requestValue / 100,
        lineTotal: row.requestValue,
      },
    ],
    statusHistory: [
      {
        status: row.status,
        changedAt: row.createdAt,
        changedBy: "Admin",
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Public API — same shapes as the real server functions would return.
// ---------------------------------------------------------------------------

export function getMockPaymentRequests(
  search: PaymentRequestsSearchSchema
): PaginatedResponse<PaymentRequest> {
  let rows = [...MOCK_ROWS]

  // Client-side filtering — mirrors what the backend would do.
  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.purchaseOrder.code.toLowerCase().includes(q)
    )
  }
  if (search.poCode) {
    const poCode = search.poCode.toLowerCase()
    rows = rows.filter((r) =>
      r.purchaseOrder.code.toLowerCase().includes(poCode)
    )
  }
  if (search.supplierId) {
    rows = rows.filter((r) => r.supplier.id === search.supplierId)
  }
  if (search.status) {
    rows = rows.filter((r) => r.status === search.status)
  }
  if (search.fromDate) {
    rows = rows.filter(
      (r) => new Date(r.createdAt) >= new Date(search.fromDate!)
    )
  }
  if (search.toDate) {
    rows = rows.filter(
      (r) =>
        new Date(r.createdAt) <= new Date(search.toDate! + "T23:59:59.999Z")
    )
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

export function getMockPaymentRequest(id: string): PaymentRequestDetail | null {
  return (
    MOCK_DETAILS[id] ??
    (MOCK_ROWS.find((r) => r.id === id)
      ? buildFallbackDetail(MOCK_ROWS.find((r) => r.id === id)!)
      : null)
  )
}

// Simulate an optimistic status mutation — returns the updated detail.
export function mockUpdatePaymentRequestStatus(
  id: string,
  status: PaymentRequestStatus,
  changedBy: string
): PaymentRequestDetail | null {
  const detail =
    MOCK_DETAILS[id] ??
    (MOCK_ROWS.find((r) => r.id === id)
      ? buildFallbackDetail(MOCK_ROWS.find((r) => r.id === id)!)
      : null)
  if (!detail) return null

  const updated: PaymentRequestDetail = {
    ...detail,
    status,
    statusHistory: [
      ...detail.statusHistory,
      { status, changedAt: new Date().toISOString(), changedBy },
    ],
  }
  MOCK_DETAILS[id] = updated

  // Also update the list row so the two stay in sync within a session.
  const listRow = MOCK_ROWS.find((r) => r.id === id)
  if (listRow) listRow.status = status

  return updated
}
