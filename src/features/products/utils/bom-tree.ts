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

export type TreeGuideType = "vertical" | "blank" | "tee" | "corner"

// Một node hiển thị trong cây BOM — node Cấp 0 (đầu bảng) và node
// COMPONENT/DIRECT thật dùng chung shape này để bảng chỉ còn một đường
// render.
export type BomTree = {
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
  // Chuỗi công đoạn của node — Cấp 0 đọc từ query riêng (route
  // `items/:itemId/operations`, không nằm trong response GET .../bom nữa),
  // node thật đọc thẳng `bomItem.operations`.
  operations: ProductOperation[]
  // Node `bom_items` thật của node — null chỉ với node Cấp 0 (không phải một
  // dòng `bom_items`, không có trang chi tiết/không xoá được qua bảng này).
  bomItem: BomItem | null
  createOptions: BomCreateOptions
  parentCode?: string | null
  parentName?: string | null
  treeGuides?: TreeGuideType[]
}

const EMPTY_CREATE_OPTIONS: BomCreateOptions = {
  childTarget: { parentId: null, parentLabel: null },
  siblingTarget: null,
}

// "0.1.2" cho node con — path (mảng rank anh em từng cấp, con trực tiếp của
// Cấp 0 bắt đầu từ [1]) đã tính sẵn ở backend (BomsService.getBomItem), đây
// chỉ là bước format hiển thị.
function formatBomPath(path: number[]): string {
  return `0.${path.join(".")}`
}

// "0.V1", "0.1.V2" cho vật tư trực tiếp ngoài cấu trúc
function formatDirectPath(path: number[], index: number): string {
  return ["0", ...path, `V${index}`].join(".")
}

// Dòng Cấp 0 dựng từ `product` — Cấp 0 không phải một dòng `bom_items` và
// không nằm trong response GET .../bom nữa (docs/decisions/
// level-0-outside-bom-tree-response.md), nên FE luôn tự dựng node này từ
// chính thông tin sản phẩm, không đọc được từ `nodes`. `operations` đọc từ
// query riêng (`itemOperationsQueryOptions`) — caller (ProductBomTable) truyền
// vào.
function mapRoot(product: Item, operations: ProductOperation[]): BomTree {
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

// Chuyển node COMPONENT (Part) thành node cây BomTree
function mapPart(
  bomItem: BomItem,
  labelByBomItemId: Map<string, string>
): BomTree {
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

// Chuyển node DIRECT (Vật tư ngoài cấu trúc) thành node cây BomTree
// STT: `<STT cha>.V<n>`, ví dụ 0.V1, 0.V2
function mapDirect(node: BomItem, index: number): BomTree {
  return {
    id: node.id,
    path: formatDirectPath(node.path, index),
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
    createOptions: EMPTY_CREATE_OPTIONS,
  }
}

// Gán thông tin cha (parentCode, parentName) cho các node con
function attachParentInfo(
  treeNodes: BomTree[],
  product: Item,
  nodeMap: Map<string, BomItem>
): void {
  for (let i = 1; i < treeNodes.length; i++) {
    const parentId = treeNodes[i].bomItem?.parentId ?? null
    if (parentId === null) {
      treeNodes[i].parentCode = product.code
      treeNodes[i].parentName = product.name
    } else {
      const parentNode = nodeMap.get(parentId)
      treeNodes[i].parentCode = parentNode?.code ?? null
      treeNodes[i].parentName = parentNode?.name ?? null
    }
  }
}

// Gán thước kẻ phân nhánh cây (tree guides) cho các node con dựa trên quan hệ cha-con
function attachTreeGuides(treeNodes: BomTree[]): void {
  // Tìm vị trí node con cuối cùng của từng parentId (O(N))
  const lastChildIndexByParent = new Map<string | null, number>()
  for (let i = 1; i < treeNodes.length; i++) {
    const parentId = treeNodes[i].bomItem?.parentId ?? null
    lastChildIndexByParent.set(parentId, i)
  }

  // Lưu parentId của từng cấp độ tổ tiên đang duyệt
  const parentIdByLevel = new Map<number, string | null>()

  for (let i = 1; i < treeNodes.length; i++) {
    const node = treeNodes[i]
    const parentId = node.bomItem?.parentId ?? null
    parentIdByLevel.set(node.level, parentId)

    const guides: TreeGuideType[] = []
    for (let depth = 1; depth <= node.level; depth++) {
      if (depth === node.level) {
        // Node cuối cùng của cùng cha dùng nhánh góc "corner" (└─), ngược lại dùng nhánh ngã ba "tee" (├─)
        const isLastChild = i === lastChildIndexByParent.get(parentId)
        guides.push(isLastChild ? "corner" : "tee")
      } else {
        // Nhánh tổ tiên: nếu tổ tiên ở cấp này vẫn còn node con phía sau thì vẽ đường thẳng "vertical" (│)
        const ancestorParentId = parentIdByLevel.get(depth) ?? null
        const hasMoreAfter =
          (lastChildIndexByParent.get(ancestorParentId) ?? 0) > i
        guides.push(hasMoreAfter ? "vertical" : "blank")
      }
    }

    node.treeGuides = guides
  }
}

export function buildBomTree(
  product: Item,
  nodes: BomItem[],
  rootOperations: ProductOperation[]
): BomTree[] {
  // 1. Chỉ giữ node COMPONENT (Part) và DIRECT ngoài cấu trúc (isOffStructure)
  const treeNodes = nodes.filter(
    (node) => node.isOffStructure || node.type !== "DIRECT"
  )

  const labelByBomItemId = new Map<string, string>()
  const directCountByParent = new Map<string | null, number>()
  const nodeMap = new Map<string, BomItem>(nodes.map((node) => [node.id, node]))

  // 2. Chuyển đổi từng node con sang BomTree (Part hoặc Direct)
  const childNodes = treeNodes.map((node) => {
    if (node.isOffStructure) {
      const index = (directCountByParent.get(node.parentId) ?? 0) + 1
      directCountByParent.set(node.parentId, index)
      return mapDirect(node, index)
    }

    labelByBomItemId.set(node.id, `${formatBomPath(node.path)} · ${node.name}`)
    return mapPart(node, labelByBomItemId)
  })

  // 3. Kết hợp Cấp 0 (Sản phẩm gốc) ở đầu cây
  const allNodes: BomTree[] = [mapRoot(product, rootOperations), ...childNodes]

  // 4. Gán thông tin cha & thước kẻ phân nhánh cây trực quan
  attachParentInfo(allNodes, product, nodeMap)
  attachTreeGuides(allNodes)

  return allNodes
}
