import type { InventoryProduct } from "@/lib/types/inventory-product.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { InventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

// ---------------------------------------------------------------------------
// Static mock data — matches the 7 items shown in the mockup screenshot.
// ---------------------------------------------------------------------------

const mockRows: InventoryProduct[] = [
  {
    id: "tp-1",
    code: "TP-240501-001",
    name: "Bracket A",
    imageUrl: null,
    unit: "pcs",
    clientName: "ABC Electronics",
    poDemandQuantity: 120,
    actualQuantity: 120,
    reservedQuantity: 30,
    exportableQuantity: 90,
    availableQuantity: 0,
    poCodes: ["PO2405-001", "PO2405-004"],
  },
  {
    id: "tp-2",
    code: "TP-240501-002",
    name: "Cover B",
    imageUrl: null,
    unit: "pcs",
    clientName: "ABC Electronics",
    poDemandQuantity: 10,
    actualQuantity: 10,
    reservedQuantity: 0,
    exportableQuantity: 10,
    availableQuantity: 0,
    poCodes: ["PO2405-002"],
  },
  {
    id: "tp-3",
    code: "TP-240501-003",
    name: "Housing C",
    imageUrl: null,
    unit: "pcs",
    clientName: "DEF Tech",
    poDemandQuantity: 0,
    actualQuantity: 0,
    reservedQuantity: 0,
    exportableQuantity: 0,
    availableQuantity: 0,
    poCodes: [],
  },
  {
    id: "tp-4",
    code: "TP-240501-004",
    name: "Shaft D",
    imageUrl: null,
    unit: "pcs",
    clientName: "GHI Industry",
    poDemandQuantity: 60,
    actualQuantity: 55,
    reservedQuantity: 20,
    exportableQuantity: 35,
    availableQuantity: -5,
    poCodes: ["PO2405-006"],
  },
  {
    id: "tp-5",
    code: "TP-240501-005",
    name: "Gear E",
    imageUrl: null,
    unit: "pcs",
    clientName: "DEF Tech",
    poDemandQuantity: 200,
    actualQuantity: 200,
    reservedQuantity: 50,
    exportableQuantity: 150,
    availableQuantity: 0,
    poCodes: ["PO2405-008"],
  },
  {
    id: "tp-6",
    code: "TP-240501-006",
    name: "Panel F",
    imageUrl: null,
    unit: "pcs",
    clientName: "JKL Co., Ltd",
    poDemandQuantity: 5,
    actualQuantity: 5,
    reservedQuantity: 5,
    exportableQuantity: 0,
    availableQuantity: 0,
    poCodes: ["PO2405-010"],
  },
  {
    id: "tp-7",
    code: "TP-240501-007",
    name: "Frame G",
    imageUrl: null,
    unit: "pcs",
    clientName: "MNO Solutions",
    poDemandQuantity: 100,
    actualQuantity: 80,
    reservedQuantity: 10,
    exportableQuantity: 70,
    availableQuantity: -20,
    poCodes: ["PO2405-012"],
  },
]

export function getMockInventoryProducts(
  search: InventoryProductsSearchSchema
): PaginatedResponse<InventoryProduct> {
  let rows = [...mockRows]

  if (search.q) {
    const q = search.q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    )
  }

  if (search.clientName && search.clientName !== "all") {
    rows = rows.filter((r) => r.clientName === search.clientName)
  }

  if (search.poCode) {
    const poCode = search.poCode.toLowerCase()
    rows = rows.filter((r) =>
      r.poCodes.some((code) => code.toLowerCase().includes(poCode))
    )
  }

  // `search.asOfDate` không lọc — mock là tồn tĩnh, không có lịch sử để cắt theo ngày; tham số
  // vẫn đi vào query key như bình thường cho tới khi có API thật.

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

export function getMockInventoryProduct(id: string): InventoryProduct | null {
  return mockRows.find((r) => r.id === id) ?? null
}
