import type {
  InventoryReceipt,
  InventoryReceiptDetail,
  InventoryReceiptStatus,
} from "@/lib/types/inventory-receipt.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { InventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — matches the 10 rows in the provided UI mockup exactly.
// ---------------------------------------------------------------------------

const MOCK_ROWS: InventoryReceipt[] = [
  {
    id: "nk-1",
    code: "NK2600001",
    receiptDate: "2026-06-17T09:15:00.000Z",
    source: "PURCHASE_ORDER",
    poOrReason: "PO260001 - CÔNG TY TNHH ABC",
    assetType: "COMPANY_MATERIAL",
    status: "AWAITING_IQC",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "nk-2",
    code: "NK2600002",
    receiptDate: "2026-06-16T14:20:00.000Z",
    source: "CUSTOMER_MATERIAL",
    poOrReason: "POKH-DAIWA-001 DAIWA VIETNAM CO., LTD",
    assetType: "CUSTOMER_MATERIAL",
    status: "AWAITING_RECEIPT",
    createdByName: "Trần Thị B",
  },
  {
    id: "nk-3",
    code: "NK2600003",
    receiptDate: "2026-06-16T10:05:00.000Z",
    source: "PRODUCTION_RETURN",
    poOrReason: "LSX260015 - Trả vật tư dư",
    assetType: "COMPANY_MATERIAL",
    status: "RECEIVED",
    createdByName: "Lê Văn C",
  },
  {
    id: "nk-4",
    code: "NK2600004",
    receiptDate: "2026-06-15T16:30:00.000Z",
    source: "PURCHASE_ORDER",
    poOrReason: "PO260002 - CÔNG TY CP THÉP HÒA PHÁT",
    assetType: "COMPANY_MATERIAL",
    status: "RECEIVED",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "nk-5",
    code: "NK2600005",
    receiptDate: "2026-06-15T09:45:00.000Z",
    source: "CUSTOMER_MATERIAL",
    poOrReason: "POKH-IMAE-002 IMAE CO., LTD",
    assetType: "CUSTOMER_MATERIAL",
    status: "AWAITING_IQC",
    createdByName: "Trần Thị B",
  },
  {
    id: "nk-6",
    code: "NK2600006",
    receiptDate: "2026-06-14T11:10:00.000Z",
    source: "OTHER_ADJUSTMENT",
    poOrReason: "Điều chỉnh kiểm kê tháng 06/2026",
    assetType: "COMPANY_MATERIAL",
    status: "RECEIVED",
    createdByName: "Lê Văn C",
  },
  {
    id: "nk-7",
    code: "NK2600007",
    receiptDate: "2026-06-13T15:25:00.000Z",
    source: "PURCHASE_ORDER",
    poOrReason: "PO260003 - CÔNG TY TNHH KIM KHÍ TÂM AN",
    assetType: "COMPANY_MATERIAL",
    status: "CANCELLED",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "nk-8",
    code: "NK2600008",
    receiptDate: "2026-06-13T08:20:00.000Z",
    source: "CUSTOMER_MATERIAL",
    poOrReason: "POKH-DAIWA-003 DAIWA VIETNAM CO., LTD",
    assetType: "CUSTOMER_MATERIAL",
    status: "DRAFT",
    createdByName: "Trần Thị B",
  },
  {
    id: "nk-9",
    code: "NK2600009",
    receiptDate: "2026-06-12T17:00:00.000Z",
    source: "OTHER_ADJUSTMENT",
    poOrReason: "Bổ sung vật tư phục vụ dự án XYZ",
    assetType: "COMPANY_MATERIAL",
    status: "DRAFT",
    createdByName: "Nguyễn Văn A",
  },
  {
    id: "nk-10",
    code: "NK2600010",
    receiptDate: "2026-06-12T09:30:00.000Z",
    source: "PURCHASE_ORDER",
    poOrReason: "PO260004 - CÔNG TY TNHH ABC",
    assetType: "COMPANY_MATERIAL",
    status: "DRAFT",
    createdByName: "Lê Văn C",
  },
]

const MOCK_DETAILS: Record<string, InventoryReceiptDetail> = {
  "nk-1": {
    ...MOCK_ROWS[0],
    warehouseName: "Kho Vật Tư Chính - Cụm A",
    delivererName: "Nguyễn Văn Giao (Tài xế)",
    note: "Giao hàng đợt 1 theo hợp đồng PO260001",
    items: [
      {
        id: "item-1",
        materialCode: "VT-TH-001",
        materialName: "Thép tấm SS400 5mm x 1500mm x 6000mm",
        unit: "Tấm",
        docQuantity: 50,
        actualQuantity: 50,
        passedQuantity: 50,
        failedQuantity: 0,
        note: "Bề mặt phẳng, không rỉ sét",
      },
      {
        id: "item-2",
        materialCode: "VT-TH-008",
        materialName: "Thép ống D60 x 3.2mm L6m",
        unit: "Cây",
        docQuantity: 120,
        actualQuantity: 120,
        passedQuantity: 120,
        failedQuantity: 0,
        note: null,
      },
      {
        id: "item-3",
        materialCode: "VT-PK-015",
        materialName: "Que hàn Kim Tín KT-421 3.2mm",
        unit: "Thùng",
        docQuantity: 20,
        actualQuantity: 20,
        passedQuantity: 20,
        failedQuantity: 0,
        note: "Nguyên tem niêm phong",
      },
    ],
    statusHistory: [
      {
        status: "DRAFT",
        changedAt: "2026-06-17T09:15:00.000Z",
        changedBy: "Nguyễn Văn A",
      },
      {
        status: "AWAITING_IQC",
        changedAt: "2026-06-17T09:30:00.000Z",
        changedBy: "Nguyễn Văn A",
      },
    ],
  },
}

function buildFallbackDetail(row: InventoryReceipt): InventoryReceiptDetail {
  return {
    ...row,
    warehouseName: "Kho Vật Tư Chính",
    delivererName: "Đại diện bên giao",
    note: null,
    items: [
      {
        id: "item-gen-1",
        materialCode: "VT-GEN-01",
        materialName: "Vật tư mẫu nhập kho",
        unit: "Cái",
        docQuantity: 100,
        actualQuantity: 100,
        passedQuantity: 100,
        failedQuantity: 0,
        note: null,
      },
    ],
    statusHistory: [
      {
        status: row.status,
        changedAt: row.receiptDate,
        changedBy: row.createdByName,
      },
    ],
  }
}

// Client-side query function filtering
export function getMockInventoryReceipts(
  search: InventoryReceiptsSearchSchema
): PaginatedResponse<InventoryReceipt> {
  let rows = [...MOCK_ROWS]

  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.poOrReason.toLowerCase().includes(q) ||
        r.createdByName.toLowerCase().includes(q)
    )
  }

  if (search.source) {
    rows = rows.filter((r) => r.source === search.source)
  }

  if (search.assetType) {
    rows = rows.filter((r) => r.assetType === search.assetType)
  }

  if (search.status) {
    rows = rows.filter((r) => r.status === search.status)
  }

  if (search.fromDate) {
    rows = rows.filter(
      (r) => new Date(r.receiptDate) >= new Date(search.fromDate!)
    )
  }

  if (search.toDate) {
    rows = rows.filter(
      (r) =>
        new Date(r.receiptDate) <= new Date(search.toDate! + "T23:59:59.999Z")
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

export function getMockInventoryReceipt(
  id: string
): InventoryReceiptDetail | null {
  return (
    MOCK_DETAILS[id] ??
    (MOCK_ROWS.find((r) => r.id === id)
      ? buildFallbackDetail(MOCK_ROWS.find((r) => r.id === id)!)
      : null)
  )
}

export function mockUpdateInventoryReceiptStatus(
  id: string,
  status: InventoryReceiptStatus,
  changedBy: string
): InventoryReceiptDetail | null {
  const detail = getMockInventoryReceipt(id)
  if (!detail) return null

  const updated: InventoryReceiptDetail = {
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

export function mockDeleteInventoryReceipt(id: string): boolean {
  const idx = MOCK_ROWS.findIndex((r) => r.id === id)
  if (idx !== -1) {
    MOCK_ROWS.splice(idx, 1)
    delete MOCK_DETAILS[id]
    return true
  }
  return false
}
