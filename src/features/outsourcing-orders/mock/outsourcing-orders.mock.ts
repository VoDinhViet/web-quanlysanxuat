import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OutsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — matches the 8 rows shown in the mockup screenshot, plus the "Ngày gửi"
// column the mockup flagged as missing.
// ---------------------------------------------------------------------------

const mockRows: OutsourcingOrder[] = [
  {
    id: "os-out-8",
    code: "OS-OUT-0008",
    createdAt: "2026-05-20T08:30:00.000Z",
    sentDate: "2026-05-21T09:00:00.000Z",
    supplierName: "ABC Co., Ltd",
    operationName: "Sơn tĩnh điện",
    totalQuantity: 120,
    receivedQuantity: 80,
    unit: "pcs",
    status: "PARTIALLY_RETURNED",
    expectedReturnDate: "2026-05-28T00:00:00.000Z",
  },
  {
    id: "os-out-7",
    code: "OS-OUT-0007",
    createdAt: "2026-05-19T09:10:00.000Z",
    sentDate: "2026-05-19T14:00:00.000Z",
    supplierName: "DEF Co., Ltd",
    operationName: "Sơn tĩnh điện",
    totalQuantity: 80,
    receivedQuantity: 80,
    unit: "pcs",
    status: "COMPLETED",
    expectedReturnDate: "2026-05-27T00:00:00.000Z",
  },
  {
    id: "os-out-6",
    code: "OS-OUT-0006",
    createdAt: "2026-05-17T10:45:00.000Z",
    sentDate: "2026-05-18T08:15:00.000Z",
    supplierName: "XYZ Co., Ltd",
    operationName: "Sơn tĩnh điện",
    totalQuantity: 60,
    receivedQuantity: 30,
    unit: "pcs",
    status: "PARTIALLY_RETURNED",
    expectedReturnDate: "2026-05-25T00:00:00.000Z",
  },
  {
    id: "os-out-5",
    code: "OS-OUT-0005",
    createdAt: "2026-05-15T13:20:00.000Z",
    sentDate: "2026-05-16T09:30:00.000Z",
    supplierName: "GHI Co., Ltd",
    operationName: "Xi mạ kẽm",
    totalQuantity: 40,
    receivedQuantity: 40,
    unit: "pcs",
    status: "COMPLETED",
    expectedReturnDate: "2026-05-22T00:00:00.000Z",
  },
  {
    id: "os-out-4",
    code: "OS-OUT-0004",
    createdAt: "2026-05-13T08:05:00.000Z",
    sentDate: "2026-05-13T15:40:00.000Z",
    supplierName: "ABC Co., Ltd",
    operationName: "Sơn tĩnh điện",
    totalQuantity: 100,
    receivedQuantity: 0,
    unit: "pcs",
    status: "IN_PROGRESS",
    expectedReturnDate: "2026-05-23T00:00:00.000Z",
  },
  {
    id: "os-out-3",
    code: "OS-OUT-0003",
    createdAt: "2026-05-11T11:00:00.000Z",
    sentDate: "2026-05-12T09:00:00.000Z",
    supplierName: "JKL Co., Ltd",
    operationName: "Cắt laser",
    totalQuantity: 50,
    receivedQuantity: 0,
    unit: "pcs",
    status: "IN_PROGRESS",
    expectedReturnDate: "2026-05-21T00:00:00.000Z",
  },
  {
    id: "os-out-2",
    code: "OS-OUT-0002",
    createdAt: "2026-05-09T14:15:00.000Z",
    sentDate: "2026-05-10T08:30:00.000Z",
    supplierName: "DEF Co., Ltd",
    operationName: "Sơn tĩnh điện",
    totalQuantity: 70,
    receivedQuantity: 20,
    unit: "pcs",
    status: "PARTIALLY_RETURNED",
    expectedReturnDate: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "os-out-1",
    code: "OS-OUT-0001",
    createdAt: "2026-05-07T09:50:00.000Z",
    sentDate: "2026-05-08T08:00:00.000Z",
    supplierName: "MNO Co., Ltd",
    operationName: "Xi mạ kẽm",
    totalQuantity: 30,
    receivedQuantity: 30,
    unit: "pcs",
    status: "COMPLETED",
    expectedReturnDate: "2026-05-16T00:00:00.000Z",
  },
]

// Highest existing numeric suffix across `OS-OUT-000N` codes — the next created phiếu continues
// this sequence instead of restarting at 1, which would collide with an existing row's code.
function resolveNextMockCode(): string {
  const maxSeq = mockRows.reduce((max, row) => {
    const seq = Number(row.code.split("-").pop())
    return Number.isFinite(seq) && seq > max ? seq : max
  }, 0)

  return `OS-OUT-${String(maxSeq + 1).padStart(4, "0")}`
}

export type AddMockOutsourcingOrderInput = {
  supplierName: string
  operationName: string
  totalQuantity: number
  unit: string
  sentDate: string
  expectedReturnDate: string
}

// Session-only — appended to the in-memory mockRows array, so it's visible for the rest of the
// browser session (list re-reads pick it up via query invalidation) but resets on page reload,
// same lifetime as every other piece of this feature's mock state.
export function addMockOutsourcingOrder(
  input: AddMockOutsourcingOrderInput
): OutsourcingOrder {
  const created: OutsourcingOrder = {
    id: `os-out-${Date.now()}`,
    code: resolveNextMockCode(),
    createdAt: new Date().toISOString(),
    sentDate: input.sentDate,
    supplierName: input.supplierName,
    operationName: input.operationName,
    totalQuantity: input.totalQuantity,
    receivedQuantity: 0,
    unit: input.unit,
    status: "IN_PROGRESS",
    expectedReturnDate: input.expectedReturnDate,
  }

  mockRows.unshift(created)
  return created
}

export function getMockOutsourcingOrders(
  search: OutsourcingOrdersSearchSchema
): PaginatedResponse<OutsourcingOrder> {
  let rows = [...mockRows]

  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.operationName.toLowerCase().includes(q)
    )
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
