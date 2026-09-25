import type { BomItem } from "@/lib/types/bom-item.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Item } from "@/lib/types/item.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import type { Unit } from "@/lib/types/unit.type"

// Nơi Part mới sẽ gắn vào khi tạo — dialog cần cả `parentLabel` để nói rõ vị
// trí, vì "Thêm Part con" và "Thêm Part cùng cấp" mở chung một dialog và nhìn
// y hệt nhau nếu không có nhãn này. `parentLabel: null` = gắn thẳng vào sản
// phẩm gốc (BOM chưa có node nào).
export type BomCreateTarget = {
  parentId: string | null
  parentLabel: string | null
}

// 2 lựa chọn tạo Part của một dòng — dialog cho chọn giữa 2 bằng thẻ trực
// quan thay vì tách thành 2 nút riêng ở bảng. `siblingTarget: null` (dòng
// Cấp 0) nghĩa là dialog bỏ qua bước chọn, luôn dùng `childTarget`.
export type BomCreateOptions = {
  childTarget: BomCreateTarget
  siblingTarget: BomCreateTarget | null
}

// Một dòng hiển thị trong bảng cây BOM — dòng Cấp 0 (đầu bảng) và dòng
// COMPONENT/DIRECT thật dùng chung shape này để bảng chỉ còn một đường
// render.
export type BomRow = {
  id: string
  path: string
  code: string
  name: string
  revision: string | null
  image: FileResource | null
  unit: Unit | null
  quantity: number
  level: number
  isRoot: boolean
  // Dòng vật tư ngoài cấu trúc — `bomItem` là node từ API cây nhưng `id` là id dòng vật tư ngoài.
  // Chuỗi công đoạn của dòng — Cấp 0 đọc từ query riêng (route
  // `items/:itemId/operations`, không nằm trong response GET .../bom nữa),
  // node thật đọc thẳng `bomItem.operations`.
  operations: ProductOperation[]
  // Node `bom_items` thật của dòng — null chỉ với dòng Cấp 0 (không phải một
  // dòng `bom_items`, không có trang chi tiết/không xoá được qua bảng này —
  // xem ViewDetailAction/DeletePartAction ở BomRowActions.tsx/
  // ProductBomTableColumns.tsx).
  bomItem: BomItem | null
  createOptions: BomCreateOptions
}

// "0.1.2" cho node con — path (mảng rank anh em từng cấp, con trực tiếp của
// Cấp 0 bắt đầu từ [1]) đã tính sẵn ở backend (BomsService.getBomItem), đây
// chỉ là bước format hiển thị.
function formatBomPath(path: number[]): string {
  return `0.${path.join(".")}`
}

// Dòng Cấp 0 dựng từ `product` — Cấp 0 không phải một dòng `bom_items` và
// không nằm trong response GET .../bom nữa (docs/decisions/
// level-0-outside-bom-tree-response.md), nên FE luôn tự dựng dòng này từ
// chính thông tin sản phẩm, không đọc được từ `nodes`. `operations` đọc từ
// query riêng (`itemOperationsQueryOptions`) — caller (ProductBomTable) truyền
// vào.
function toRootRow(product: Item, operations: ProductOperation[]): BomRow {
  return {
    id: "root",
    path: "0",
    code: product.code,
    name: product.name,
    revision: product.revision,
    image: product.image,
    unit: null,
    quantity: 1,
    level: 0,
    isRoot: true,
    operations,
    bomItem: null,
    createOptions: {
      childTarget: { parentId: null, parentLabel: null },
      siblingTarget: null,
    },
  }
}

function toBomRow(
  bomItem: BomItem,
  labelByBomItemId: Map<string, string>
): BomRow {
  return {
    id: bomItem.id,
    path: formatBomPath(bomItem.path),
    code: bomItem.code,
    name: bomItem.name,
    revision: bomItem.revision,
    image: bomItem.image,
    unit: bomItem.unit,
    quantity: bomItem.quantity,
    level: bomItem.level,
    isRoot: false,
    operations: bomItem.operations,
    bomItem,
    createOptions: {
      childTarget: {
        parentId: bomItem.id,
        parentLabel: labelByBomItemId.get(bomItem.id) ?? null,
      },
      siblingTarget: {
        parentId: bomItem.parentId,
        parentLabel:
          bomItem.parentId !== null
            ? (labelByBomItemId.get(bomItem.parentId) ?? null)
            : null,
      },
    },
  }
}

// Vật tư ngoài đứng ngay sau chủ trong `nodes` (BE đã sắp) — STT `<STT chủ>.V<n>`, không đụng STT Part.
function toExtraRow(node: BomItem, index: number): BomRow {
  return {
    id: node.id,
    path: ["0", ...node.path, `V${index}`].join("."),
    code: node.code,
    name: node.name,
    revision: null,
    image: node.image,
    unit: node.unit,
    quantity: node.quantity,
    level: node.level,
    isRoot: false,
    operations: [],
    bomItem: node,
    createOptions: {
      childTarget: { parentId: null, parentLabel: null },
      siblingTarget: null,
    },
  }
}

export function buildBomRows(
  product: Item,
  nodes: BomItem[],
  rootOperations: ProductOperation[]
): BomRow[] {
  // Backend đã trả `nodes` đúng thứ tự depth-first kèm `path` tính sẵn
  // (BomsService.getBomItem) — chỉ cần lọc bỏ DIRECT thật (chỉ hiện trong tab "Vật tư" ở trang
  // chi tiết) nhưng giữ vật tư ngoài cấu trúc (`isOffStructure`) rồi map thẳng.
  const treeNodes = nodes.filter(
    (node) => node.isOffStructure || node.type !== "DIRECT"
  )
  const labelByBomItemId = new Map<string, string>()
  const extraCountByOwner = new Map<string | null, number>()

  // Một lượt duy nhất: cha luôn đứng trước con trong thứ tự depth-first, nên
  // `labelByBomItemId` của cha đã sẵn sàng khi con đọc nó cho `siblingTarget`.
  const rows = treeNodes.map((node) => {
    if (node.isOffStructure) {
      const index = (extraCountByOwner.get(node.parentId) ?? 0) + 1
      extraCountByOwner.set(node.parentId, index)
      return toExtraRow(node, index)
    }

    labelByBomItemId.set(node.id, `${formatBomPath(node.path)} · ${node.name}`)
    return toBomRow(node, labelByBomItemId)
  })

  return [toRootRow(product, rootOperations), ...rows]
}
