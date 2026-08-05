import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import type { InventoryMaterial } from "@/lib/types/inventory-material.type"
import { InventoryStatus } from "@/lib/types/inventory-material.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

// ---------------------------------------------------------------------------
// NOTE: Backend endpoint `/api/inventory/materials` does not exist yet.
// This server function returns deterministic mock data so the UI can be
// developed and reviewed independently. Replace the handler body with a real
// `http.get(...)` call once the API is ready — no other changes are needed.
// ---------------------------------------------------------------------------

const MATERIAL_NAMES: [string, string, string][] = [
  ["VT000001", "Thép tấm SS400 3mm", "Thép tấm"],
  ["VT000002", "Bulon lục giác M12x30", "Bulon - Ốc vít"],
  ["VT000003", "Đai ốc M12", "Bulon - Ốc vít"],
  ["VT000004", "Long đen phẳng M12", "Bulon - Ốc vít"],
  ["VT000005", "Que hàn CO2 ER70S-6 1.2mm", "Vật tư hàn"],
  ["VT000006", "Sơn tĩnh điện màu đen", "Sơn - Hóa chất"],
  ["VT000007", "Đá cắt 107x1.2x16mm", "Vật tư phụ"],
  ["VT000008", "Găng tay len phủ cao su", "Bảo hộ lao động"],
  ["VT000009", "Băng keo giấy 24mm", "Vật tư phụ"],
  ["VT000010", "Dầu thủy lực 32", "Dầu nhớt"],
  ["VT000011", "Ống thép đen phi 60", "Thép ống"],
  ["VT000012", "Thép hộp 50x50x2mm", "Thép hộp"],
  ["VT000013", "Thép góc L50x50x5", "Thép hình"],
  ["VT000014", "Keo silicone trắng 300ml", "Sơn - Hóa chất"],
  ["VT000015", "Đĩa mài 115x6x22mm", "Vật tư phụ"],
  ["VT000016", "Mũi khoan sắt D10", "Dụng cụ cắt"],
  ["VT000017", "Bulon M8x25 mạ kẽm", "Bulon - Ốc vít"],
  ["VT000018", "Vít tự khoan 4.2x13mm", "Bulon - Ốc vít"],
  ["VT000019", "Sơn chống gỉ màu xám", "Sơn - Hóa chất"],
  ["VT000020", "Thép tấm CT3 5mm", "Thép tấm"],
  ["VT000021", "Que hàn điện 3.2mm", "Vật tư hàn"],
  ["VT000022", "Khí Argon công nghiệp", "Khí công nghiệp"],
  ["VT000023", "Mặt kính hàn tối", "Bảo hộ lao động"],
  ["VT000024", "Giấy nhám 120 khô", "Vật tư phụ"],
  ["VT000025", "Thép thanh tròn D20", "Thép hình"],
  ["VT000026", "Long đen vênh M10", "Bulon - Ốc vít"],
  ["VT000027", "Ốc vít inox M6x20", "Bulon - Ốc vít"],
  ["VT000028", "Chổi sắt cán gỗ", "Dụng cụ"],
  ["VT000029", "Thùng đựng phế liệu 120L", "Vật tư phụ"],
  ["VT000030", "Băng dính bạc 48mm", "Vật tư phụ"],
]

const UNITS: Record<string, string> = {
  "Thép tấm": "Kg",
  "Bulon - Ốc vít": "Cái",
  "Vật tư hàn": "Kg",
  "Sơn - Hóa chất": "Kg",
  "Vật tư phụ": "Cái",
  "Bảo hộ lao động": "Đôi",
  "Dầu nhớt": "Lít",
  "Thép ống": "Cây",
  "Thép hộp": "Cây",
  "Thép hình": "Cây",
  "Dụng cụ cắt": "Cái",
  "Khí công nghiệp": "Bình",
  "Dụng cụ": "Cái",
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function buildMockRow(
  index: number,
  seed: number
): InventoryMaterial {
  const [code, name, groupName] = MATERIAL_NAMES[index % MATERIAL_NAMES.length]
  const r = (n: number) => Math.round(seededRandom(seed * 31 + n) * 1000)

  const stockActual = r(1) + 50
  const stockHeld = Math.round(stockActual * seededRandom(seed * 7 + 2) * 0.4)
  const stockAvailable = stockActual - stockHeld
  const demandBom = Math.round(stockActual * seededRandom(seed * 13 + 3) * 0.6)
  const stockUsable = stockActual - demandBom
  const minStock = Math.round(seededRandom(seed * 17 + 4) * 200) + 10

  let status: InventoryStatus
  if (stockUsable < 0) {
    status = InventoryStatus.SHORTAGE
  } else if (stockUsable < minStock) {
    status = InventoryStatus.WARNING
  } else {
    status = InventoryStatus.NORMAL
  }

  return {
    id: `inv-${String(index + 1).padStart(3, "0")}`,
    code,
    name,
    unit: {
      id: `unit-${index}`,
      name: UNITS[groupName] ?? "Cái",
    },
    group: { id: `group-${index}`, name: groupName },
    image: null,
    stockActual,
    stockHeld,
    stockAvailable,
    demandBom,
    stockUsable,
    minStock,
    status,
  }
}

const getInventoryMaterialsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  materialGroupId: z.string().trim().min(1).optional(),
  status: z.enum(InventoryStatus).optional(),
  order: z.enum(SORT_ORDERS).optional(),
})

export const getInventoryMaterials = createServerFn({ method: "GET" })
  .validator(getInventoryMaterialsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<InventoryMaterial>> => {
      const page = data.page ?? 1
      const limit = data.limit ?? 10

      // Build entire dataset then filter in-process (mock only).
      let rows = MATERIAL_NAMES.map((_, idx) =>
        buildMockRow(idx, idx + 1)
      )

      // Filter by search term
      if (data.q) {
        const q = data.q.toLowerCase()
        rows = rows.filter(
          (row) =>
            row.code.toLowerCase().includes(q) ||
            row.name.toLowerCase().includes(q)
        )
      }

      // Filter by group
      if (data.materialGroupId) {
        rows = rows.filter(
          (row) => row.group.id === data.materialGroupId
        )
      }

      // Filter by status
      if (data.status) {
        rows = rows.filter((row) => row.status === data.status)
      }

      const totalRecords = rows.length
      const totalPages = Math.ceil(totalRecords / limit) || 1
      const start = (page - 1) * limit
      const pageRows = rows.slice(start, start + limit)

      return {
        data: pageRows,
        pagination: {
          limit,
          currentPage: page,
          nextPage: page < totalPages ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
          totalRecords,
          totalPages,
        },
      }
    }
  )
