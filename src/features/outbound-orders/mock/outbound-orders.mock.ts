import type {
  OutboundOrder,
  OutboundOrderDetail,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — matches the 9 rows shown in the mockup screenshot.
// ---------------------------------------------------------------------------

const MOCK_ROWS: OutboundOrder[] = [
  {
    id: "do-1",
    code: "DO-250608-001",
    createdAt: "2025-06-08T10:32:00.000Z",
    clientName: "ABC Electronics",
    poOrReason: "PO-250501, PO-250502",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 120,
    unit: "pcs",
    status: "DRAFT",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "do-2",
    code: "DO-250607-004",
    createdAt: "2025-06-07T15:20:00.000Z",
    clientName: "DEF Tech",
    poOrReason: "PO-250503",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 80,
    unit: "pcs",
    status: "AWAITING_APPROVAL",
    createdByName: "Trần Thị B",
  },
  {
    id: "do-3",
    code: "DO-250607-003",
    createdAt: "2025-06-07T09:15:00.000Z",
    clientName: "GHI Industry",
    poOrReason: "PO-250401",
    deliveryMethod: "EXPRESS_DELIVERY",
    totalQuantity: 50,
    unit: "pcs",
    status: "AWAITING_DELIVERY_CONFIRMATION",
    createdByName: "Lê Văn C",
  },
  {
    id: "do-4",
    code: "DO-250606-002",
    createdAt: "2025-06-06T11:05:00.000Z",
    clientName: "ABC Electronics",
    poOrReason: "PO-250504, PO-250505",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 150,
    unit: "pcs",
    status: "AWAITING_DELIVERY_CONFIRMATION",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "do-5",
    code: "DO-250605-007",
    createdAt: "2025-06-05T14:40:00.000Z",
    clientName: "MNO Solutions",
    poOrReason: "PO-250506",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 30,
    unit: "pcs",
    status: "DELIVERED",
    createdByName: "Trần Thị B",
  },
  {
    id: "do-6",
    code: "DO-250604-005",
    createdAt: "2025-06-04T10:10:00.000Z",
    clientName: "DEF Tech",
    poOrReason: "PO-250507",
    deliveryMethod: "EXPRESS_DELIVERY",
    totalQuantity: 60,
    unit: "pcs",
    status: "DELIVERED",
    createdByName: "Lê Văn C",
  },
  {
    id: "do-7",
    code: "DO-250603-009",
    createdAt: "2025-06-03T16:25:00.000Z",
    clientName: "JKL Co., Ltd",
    poOrReason: "PO-250508, PO-250509",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 200,
    unit: "pcs",
    status: "DELIVERED",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "do-8",
    code: "DO-250602-001",
    createdAt: "2025-06-02T09:30:00.000Z",
    clientName: "ABC Electronics",
    poOrReason: "PO-250402",
    deliveryMethod: "DOOR_DELIVERY",
    totalQuantity: 70,
    unit: "pcs",
    status: "DELIVERED",
    createdByName: "Trần Thị B",
  },
  {
    id: "do-9",
    code: "DO-250601-006",
    createdAt: "2025-06-01T08:50:00.000Z",
    clientName: "PQR Vietnam",
    poOrReason: "PO-250510",
    deliveryMethod: "EXPRESS_DELIVERY",
    totalQuantity: 40,
    unit: "pcs",
    status: "CANCELLED",
    createdByName: "Lê Văn C",
  },
]

const MOCK_DETAILS: Record<string, OutboundOrderDetail> = {
  "do-1": {
    ...MOCK_ROWS[0],
    deliveryAddress: "Khu công nghiệp Yên Phong, Bắc Ninh",
    driverName: "Nguyễn Văn X (Tài xế)",
    driverPhone: "0912 345 678",
    note: "Giao hàng giờ hành chính, liên hệ bảo vệ trước khi vào kho.",
    items: [
      {
        id: "item-1",
        productCode: "TP-240501-001",
        productName: "Bracket A",
        unit: "pcs",
        orderedQuantity: 70,
        deliveredQuantity: 70,
        note: "Đóng gói thùng gỗ 10 chiếc/thùng",
      },
      {
        id: "item-2",
        productCode: "TP-240501-002",
        productName: "Cover B",
        unit: "pcs",
        orderedQuantity: 50,
        deliveredQuantity: 50,
        note: "Kèm biên bản kiểm tra chất lượng",
      },
    ],
    statusHistory: [
      {
        status: "DRAFT",
        changedAt: "2025-06-08T10:32:00.000Z",
        changedBy: "Nguyễn Văn A",
      },
    ],
  },
}

function buildFallbackDetail(row: OutboundOrder): OutboundOrderDetail {
  return {
    ...row,
    deliveryAddress: "Địa chỉ giao hàng mặc định của khách hàng",
    driverName: "Tài xế giao hàng",
    driverPhone: "0900 000 000",
    note: null,
    items: [
      {
        id: "item-gen-1",
        productCode: "TP-240501-001",
        productName: "Thành phẩm xuất giao mẫu",
        unit: row.unit,
        orderedQuantity: row.totalQuantity,
        deliveredQuantity: row.totalQuantity,
        note: null,
      },
    ],
    statusHistory: [
      {
        status: row.status,
        changedAt: row.createdAt,
        changedBy: row.createdByName ?? "System",
      },
    ],
  }
}

export function getMockOutboundOrders(
  search: OutboundOrdersSearchSchema
): PaginatedResponse<OutboundOrder> {
  let rows = [...MOCK_ROWS]

  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter((r) => r.code.toLowerCase().includes(q))
  }

  if (search.clientName && search.clientName !== "all") {
    rows = rows.filter((r) => r.clientName === search.clientName)
  }

  if (search.poCode) {
    const poCode = search.poCode.toLowerCase()
    rows = rows.filter((r) => r.poOrReason.toLowerCase().includes(poCode))
  }

  if (search.status && search.status !== ("all" as any)) {
    rows = rows.filter((r) => r.status === search.status)
  }

  if (search.deliveryMethod && search.deliveryMethod !== ("all" as any)) {
    rows = rows.filter((r) => r.deliveryMethod === search.deliveryMethod)
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

export function getMockOutboundOrder(id: string): OutboundOrderDetail | null {
  return (
    MOCK_DETAILS[id] ??
    (MOCK_ROWS.find((r) => r.id === id)
      ? buildFallbackDetail(MOCK_ROWS.find((r) => r.id === id)!)
      : null)
  )
}

export function mockUpdateOutboundOrderStatus(
  id: string,
  status: OutboundOrderStatus,
  changedBy: string
): OutboundOrderDetail | null {
  const detail = getMockOutboundOrder(id)
  if (!detail) return null

  const updated: OutboundOrderDetail = {
    ...detail,
    status,
    statusHistory: [
      ...detail.statusHistory,
      { status, changedAt: new Date().toISOString(), changedBy },
    ],
  }
  MOCK_DETAILS[id] = updated

  const listRow = MOCK_ROWS.find((r) => r.id === id)
  if (listRow) listRow.status = status

  return updated
}

export function mockDeleteOutboundOrder(id: string): boolean {
  const idx = MOCK_ROWS.findIndex((r) => r.id === id)
  if (idx !== -1) {
    MOCK_ROWS.splice(idx, 1)
    delete MOCK_DETAILS[id]
    return true
  }
  return false
}
