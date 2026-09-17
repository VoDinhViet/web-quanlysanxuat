import type { BomItem } from "@/lib/types/bom-item.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Item } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"

type FlatChild = {
  bomItem: BomItem
  path: string
}

// GET .../bom trả mảng phẳng, sắp theo (level, sortOrder) chứ không phải depth-first theo từng
// nhánh — gom con theo cha một lần rồi duyệt đệ quy để ra đúng thứ tự hiển thị + số path ("1.2").
// CONSUMABLE bị bỏ qua ở đây — chỉ render trong sheet chi tiết (tab Vật tư), không phải trong cây.
function groupChildrenByParentId(nodes: BomItem[]): Map<string, BomItem[]> {
  const map = new Map<string, BomItem[]>()
  nodes.forEach((bomItem) => {
    if (bomItem.type !== "COMPONENT" || bomItem.parentId === null) return
    const siblings = map.get(bomItem.parentId) ?? []
    siblings.push(bomItem)
    map.set(bomItem.parentId, siblings)
  })
  return map
}

function flattenChildren(
  childrenByParentId: Map<string, BomItem[]>,
  parentId: string,
  parentPath: string,
  out: FlatChild[]
): void {
  const children = childrenByParentId.get(parentId) ?? []
  children.forEach((bomItem, index) => {
    const path = `${parentPath}.${index + 1}`
    out.push({ bomItem, path })
    flattenChildren(childrenByParentId, bomItem.id, path, out)
  })
}

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
// ROOT/dòng gốc tạm) nghĩa là dialog bỏ qua bước chọn, luôn dùng `childTarget`.
export type BomCreateOptions = {
  childTarget: BomCreateTarget
  siblingTarget: BomCreateTarget | null
}

// Một dòng hiển thị trong bảng cây BOM — thống nhất 3 trường hợp trước đây
// tách riêng (ROOT thật, dòng gốc tạm khi BOM rỗng, COMPONENT) thành một shape
// duy nhất để bảng chỉ còn một đường render.
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
  // Node COMPONENT thật của dòng, hoặc null cho dòng ROOT (kể cả dòng gốc tạm
  // khi BOM rỗng) — ROOT không có trang chi tiết riêng và không xoá qua đây,
  // nên mọi thao tác Xem chi tiết/Xoá chỉ cần kiểm tra đúng field này.
  component: BomItem | null
  createOptions: BomCreateOptions
}

// Dòng gốc tạm dựng từ `product` khi BOM chưa có node nào (backend sinh ROOT
// lazily ở lần ghi đầu, docs/workflows/product-setup.md) — chỉ có một hành
// động: thêm Part đầu tiên.
function toEmptyRootRow(product: Item): BomRow {
  return {
    id: "root-empty",
    path: "0",
    code: product.code,
    name: product.name,
    revision: product.revision,
    image: product.image,
    unit: null,
    quantity: 1,
    level: 0,
    isRoot: true,
    component: null,
    createOptions: {
      childTarget: { parentId: null, parentLabel: null },
      siblingTarget: null,
    },
  }
}

function toBomRow(
  bomItem: BomItem,
  path: string,
  isRoot: boolean,
  labelByBomItemId: Map<string, string>
): BomRow {
  return {
    id: bomItem.id,
    path,
    code: bomItem.code,
    name: bomItem.name,
    revision: bomItem.revision,
    image: bomItem.image,
    unit: bomItem.unit,
    // ROOT luôn đại diện đúng 1 sản phẩm gốc, bất kể `quantity` thô trên node.
    quantity: isRoot ? 1 : bomItem.quantity,
    level: bomItem.level,
    isRoot,
    component: isRoot ? null : bomItem,
    createOptions: {
      childTarget: {
        parentId: bomItem.id,
        parentLabel: labelByBomItemId.get(bomItem.id) ?? null,
      },
      // ROOT không có "cùng cấp" — mỗi BOM chỉ có đúng 1 dòng ROOT.
      siblingTarget: isRoot
        ? null
        : {
            parentId: bomItem.parentId,
            parentLabel:
              bomItem.parentId !== null
                ? (labelByBomItemId.get(bomItem.parentId) ?? null)
                : null,
          },
    },
  }
}

export function buildBomRows(product: Item, nodes: BomItem[]): BomRow[] {
  const rootItem = nodes.find((bomItem) => bomItem.type === "ROOT") ?? null
  if (!rootItem) {
    return [toEmptyRootRow(product)]
  }

  const flatChildren: FlatChild[] = []
  flattenChildren(
    groupChildrenByParentId(nodes),
    rootItem.id,
    "0",
    flatChildren
  )

  const labelByBomItemId = new Map<string, string>()
  labelByBomItemId.set(rootItem.id, `0 · ${rootItem.name}`)
  flatChildren.forEach(({ bomItem, path }) => {
    labelByBomItemId.set(bomItem.id, `${path} · ${bomItem.name}`)
  })

  return [
    toBomRow(rootItem, "0", true, labelByBomItemId),
    ...flatChildren.map(({ bomItem, path }) =>
      toBomRow(bomItem, path, false, labelByBomItemId)
    ),
  ]
}
