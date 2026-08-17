import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// ---------------------------------------------------------------------------
// Static mock data for the OS-OUT create-wizard picker — 14 rows across 3 Job, spanning the 4
// công đoạn already used by outsourcing-orders.mock.ts's list rows (Sơn tĩnh điện/Xi mạ kẽm/Cắt
// laser/+ Phay CNC). A few rows are seeded at `remainingQuantity: 0` on purpose, so the picker's
// "đã gửi đủ" locked-row state has something real to show without waiting for a first submit.
// ---------------------------------------------------------------------------

const mockRows: OutsourceableOperation[] = [
  {
    id: "poo-01",
    productionJobId: "job-1",
    productionJobCode: "JOB2608-01",
    itemId: "item-km-01",
    itemCode: "KM-01",
    itemName: "Khung máy 01",
    operationId: "op-son-tinh-dien",
    operationCode: "OP-STD",
    operationName: "Sơn tĩnh điện",
    unitName: "cái",
    plannedQuantity: 50,
    sentQuantity: 20,
    remainingQuantity: 30,
  },
  {
    id: "poo-02",
    productionJobId: "job-1",
    productionJobCode: "JOB2608-01",
    itemId: "item-km-01",
    itemCode: "KM-01",
    itemName: "Khung máy 01",
    operationId: "op-xi-ma-kem",
    operationCode: "OP-XMK",
    operationName: "Xi mạ kẽm",
    unitName: "cái",
    plannedQuantity: 50,
    sentQuantity: 50,
    remainingQuantity: 0,
  },
  {
    id: "poo-03",
    productionJobId: "job-1",
    productionJobCode: "JOB2608-01",
    itemId: "item-km-02",
    itemCode: "KM-02",
    itemName: "Giá đỡ 02",
    operationId: "op-son-tinh-dien",
    operationCode: "OP-STD",
    operationName: "Sơn tĩnh điện",
    unitName: "cái",
    plannedQuantity: 60,
    sentQuantity: 30,
    remainingQuantity: 30,
  },
  {
    id: "poo-04",
    productionJobId: "job-1",
    productionJobCode: "JOB2608-01",
    itemId: "item-km-cnc-01",
    itemCode: "KM-CNC-01",
    itemName: "Khung chính CNC",
    operationId: "op-phay-cnc",
    operationCode: "OP-CNC",
    operationName: "Phay CNC",
    unitName: "cái",
    plannedQuantity: 20,
    sentQuantity: 10,
    remainingQuantity: 10,
  },
  {
    id: "poo-05",
    productionJobId: "job-1",
    productionJobCode: "JOB2608-01",
    itemId: "item-tn-01",
    itemCode: "TN-01",
    itemName: "Tấm nắp trên",
    operationId: "op-xi-ma-kem",
    operationCode: "OP-XMK",
    operationName: "Xi mạ kẽm",
    unitName: "cái",
    plannedQuantity: 40,
    sentQuantity: 0,
    remainingQuantity: 40,
  },
  {
    id: "poo-06",
    productionJobId: "job-2",
    productionJobCode: "JOB2608-02",
    itemId: "item-br-01",
    itemCode: "BR-01",
    itemName: "Bánh răng 01",
    operationId: "op-cat-laser",
    operationCode: "OP-CL",
    operationName: "Cắt laser",
    unitName: "cái",
    plannedQuantity: 100,
    sentQuantity: 40,
    remainingQuantity: 60,
  },
  {
    id: "poo-07",
    productionJobId: "job-2",
    productionJobCode: "JOB2608-02",
    itemId: "item-br-02",
    itemCode: "BR-02",
    itemName: "Bánh răng 02",
    operationId: "op-cat-laser",
    operationCode: "OP-CL",
    operationName: "Cắt laser",
    unitName: "cái",
    plannedQuantity: 80,
    sentQuantity: 80,
    remainingQuantity: 0,
  },
  {
    id: "poo-08",
    productionJobId: "job-2",
    productionJobCode: "JOB2608-02",
    itemId: "item-td-01",
    itemCode: "TD-01",
    itemName: "Trục dẫn 01",
    operationId: "op-phay-cnc",
    operationCode: "OP-CNC",
    operationName: "Phay CNC",
    unitName: "cái",
    plannedQuantity: 30,
    sentQuantity: 15,
    remainingQuantity: 15,
  },
  {
    id: "poo-09",
    productionJobId: "job-2",
    productionJobCode: "JOB2608-02",
    itemId: "item-vo-01",
    itemCode: "VO-01",
    itemName: "Vỏ bọc ngoài",
    operationId: "op-son-tinh-dien",
    operationCode: "OP-STD",
    operationName: "Sơn tĩnh điện",
    unitName: "cái",
    plannedQuantity: 45,
    sentQuantity: 20,
    remainingQuantity: 25,
  },
  {
    id: "poo-10",
    productionJobId: "job-3",
    productionJobCode: "JOB2608-03",
    itemId: "item-gd-01",
    itemCode: "GD-01",
    itemName: "Giá đỡ động cơ",
    operationId: "op-xi-ma-kem",
    operationCode: "OP-XMK",
    operationName: "Xi mạ kẽm",
    unitName: "cái",
    plannedQuantity: 25,
    sentQuantity: 25,
    remainingQuantity: 0,
  },
  {
    id: "poo-11",
    productionJobId: "job-3",
    productionJobCode: "JOB2608-03",
    itemId: "item-gd-02",
    itemCode: "GD-02",
    itemName: "Giá đỡ phụ",
    operationId: "op-xi-ma-kem",
    operationCode: "OP-XMK",
    operationName: "Xi mạ kẽm",
    unitName: "cái",
    plannedQuantity: 35,
    sentQuantity: 10,
    remainingQuantity: 25,
  },
  {
    id: "poo-12",
    productionJobId: "job-3",
    productionJobCode: "JOB2608-03",
    itemId: "item-nc-01",
    itemCode: "NC-01",
    itemName: "Nắp che bụi",
    operationId: "op-son-tinh-dien",
    operationCode: "OP-STD",
    operationName: "Sơn tĩnh điện",
    unitName: "cái",
    plannedQuantity: 70,
    sentQuantity: 35,
    remainingQuantity: 35,
  },
  {
    id: "poo-13",
    productionJobId: "job-3",
    productionJobCode: "JOB2608-03",
    itemId: "item-tr-01",
    itemCode: "TR-01",
    itemName: "Thanh ray trượt",
    operationId: "op-cat-laser",
    operationCode: "OP-CL",
    operationName: "Cắt laser",
    unitName: "cái",
    plannedQuantity: 55,
    sentQuantity: 0,
    remainingQuantity: 55,
  },
  {
    id: "poo-14",
    productionJobId: "job-3",
    productionJobCode: "JOB2608-03",
    itemId: "item-tr-02",
    itemCode: "TR-02",
    itemName: "Thanh ray phụ",
    operationId: "op-phay-cnc",
    operationCode: "OP-CNC",
    operationName: "Phay CNC",
    unitName: "cái",
    plannedQuantity: 40,
    sentQuantity: 40,
    remainingQuantity: 0,
  },
]

// Derived once at module load — every distinct Job / công đoạn already present in mockRows, so
// the picker's filter dropdowns can never point at a value the data doesn't have.
export const outsourceableJobOptions = Array.from(
  new Map(
    mockRows.map((row) => [
      row.productionJobId,
      { value: row.productionJobId, label: row.productionJobCode },
    ])
  ).values()
)

export const outsourceableOperationOptions = Array.from(
  new Map(
    mockRows.map((row) => [
      row.operationId,
      { value: row.operationId, label: row.operationName },
    ])
  ).values()
)

export type GetMockOutsourceableOperationsParams = {
  page: number
  limit: number
  q?: string
  productionJobId?: string
  operationId?: string
}

export function getMockOutsourceableOperations(
  params: GetMockOutsourceableOperationsParams
): PaginatedResponse<OutsourceableOperation> {
  let rows = [...mockRows]

  if (params.q) {
    const q = params.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.itemCode.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.productionJobCode.toLowerCase().includes(q)
    )
  }

  if (params.productionJobId) {
    rows = rows.filter((r) => r.productionJobId === params.productionJobId)
  }

  if (params.operationId) {
    rows = rows.filter((r) => r.operationId === params.operationId)
  }

  const totalRecords = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / params.limit))
  const currentPage = Math.min(params.page, totalPages)
  const offset = (currentPage - 1) * params.limit
  const data = rows.slice(offset, offset + params.limit)

  return {
    data,
    pagination: {
      currentPage,
      limit: params.limit,
      totalRecords,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    },
  }
}

// Mutates mockRows in place — called by create-outsourcing-order.mock.ts after a phiếu is
// created, so reopening the wizard shows updated sentQuantity/remainingQuantity. Session-only,
// same lifetime as outsourcing-orders.mock.ts's own in-memory store.
export function accumulateMockSentQuantity(
  operationId: string,
  quantity: number
): void {
  const row = mockRows.find((r) => r.id === operationId)
  if (!row) return

  row.sentQuantity += quantity
  row.remainingQuantity = Math.max(0, row.remainingQuantity - quantity)
}
