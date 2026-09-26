import {
  AddCircle,
  Bag4,
  Box,
  Buildings2,
  Cart3,
  ChartSquare,
  CheckCircle,
  Eye,
  Pen,
  ShieldCheck,
  MedalRibbon,
  TrashBinTrash,
  Widget,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import type {
  PermissionCatalogueGroup,
  PermissionCatalogueItem,
} from "@/features/roles/api/server-functions/get-permission-catalogue.api"
import type { PermissionCode } from "@/lib/types/permission.type"

type Icon = ComponentType<IconProps>

type GridActionDef = {
  key: string
  label: string
  // Icon + màu cùng tone với viền header — nhận diện cột bằng hình trước khi đọc chữ.
  icon: Icon
  iconClassName: string
  // Dòng phụ dưới nhãn cột.
  hint: string
  // Viền dưới cùng tone — kẻ ranh giới cột ngay dưới header (Xem xanh dương thông tin, Tạo xanh
  // lá tạo mới, Sửa hổ phách chỉnh sửa, Duyệt tím xét duyệt, Xoá đỏ cùng tone với nút xoá còn lại
  // trong app), giúp quét nhanh theo cột dễ hơn.
  headerAccentClassName: string
}

/** The 5 CRUD-shaped actions the matrix renders as columns. Any permission whose action
 *  isn't one of these (items:copy, items:bom-manage, …) becomes a chip on its module row
 *  instead — see `PermissionModule.extras`. */
export const gridActions = [
  {
    key: "read",
    icon: Eye,
    iconClassName: "text-blue-500",
    hint: "Xem dữ liệu",
    label: "Xem",
    headerAccentClassName: "border-b-blue-500/50",
  },
  {
    key: "create",
    icon: AddCircle,
    iconClassName: "text-emerald-500",
    hint: "Thêm mới",
    label: "Tạo",
    headerAccentClassName: "border-b-emerald-500/50",
  },
  {
    key: "update",
    icon: Pen,
    iconClassName: "text-amber-500",
    hint: "Chỉnh sửa",
    label: "Sửa",
    headerAccentClassName: "border-b-amber-500/50",
  },
  {
    key: "approve",
    icon: MedalRibbon,
    iconClassName: "text-violet-500",
    hint: "Phê duyệt",
    label: "Duyệt",
    headerAccentClassName: "border-b-violet-500/50",
  },
  {
    key: "delete",
    icon: TrashBinTrash,
    iconClassName: "text-destructive",
    hint: "Xoá dữ liệu",
    label: "Xoá",
    headerAccentClassName: "border-b-destructive/50",
  },
] as const satisfies GridActionDef[]

export type GridAction = (typeof gridActions)[number]["key"]

function isGridAction(action: string): action is GridAction {
  return gridActions.some((a) => a.key === action)
}

/** Icon per business block — presentation only; the block grouping itself (which resource
 *  belongs to which block, and in what order) comes from the backend catalogue's own
 *  `block`/`blockLabel` fields, not a parallel map kept here. */
const blockIcons: Record<string, Icon> = {
  system: ShieldCheck,
  catalog: Box,
  sales: Cart3,
  warehouse: Buildings2,
  production: Widget,
  purchasing: Bag4,
  quality: CheckCircle,
  reports: ChartSquare,
}

export type PermissionModule = {
  resource: string
  label: string
  description: string
  byAction: Partial<Record<GridAction, PermissionCatalogueItem>>
  extras: PermissionCatalogueItem[]
}

export type PermissionBlock = {
  key: string
  label: string
  icon: Icon
  modules: PermissionModule[]
}

function buildModule(group: PermissionCatalogueGroup): PermissionModule {
  const byAction: Partial<Record<GridAction, PermissionCatalogueItem>> = {}
  const extras: PermissionCatalogueItem[] = []

  for (const permission of group.permissions) {
    if (isGridAction(permission.action) && !byAction[permission.action]) {
      byAction[permission.action] = permission
    } else {
      extras.push(permission)
    }
  }

  return {
    resource: group.resource,
    label: group.label,
    description: group.description ?? "",
    byAction,
    extras,
  }
}

/** Buckets the catalogue's flat, already block-ordered group list into sticky sections —
 *  consecutive groups sharing the same `block` become one `PermissionBlock`, in arrival
 *  order, so a new backend block needs no matching change here. */
export function buildPermissionBlocks(
  catalogue: PermissionCatalogueGroup[]
): PermissionBlock[] {
  const blocks: PermissionBlock[] = []

  for (const group of catalogue) {
    const current = blocks.at(-1)
    const module = buildModule(group)

    if (current && current.key === group.block) {
      current.modules.push(module)
    } else {
      blocks.push({
        key: group.block,
        label: group.blockLabel,
        icon: blockIcons[group.block] ?? Box,
        modules: [module],
      })
    }
  }

  return blocks
}

/** Every permission in a module — CRUD columns plus extras. `Object.values` on a
 *  `Partial<Record<...>>` types as fully-present (a stdlib quirk), so this indexes
 *  `byAction` via `gridActions` directly instead, which keeps the real `| undefined`. */
function modulePermissions(
  module: PermissionModule
): PermissionCatalogueItem[] {
  return [
    ...gridActions
      .map((a) => module.byAction[a.key])
      .filter((p) => p !== undefined),
    ...module.extras,
  ]
}

function moduleMatches(module: PermissionModule, query: string): boolean {
  return [
    module.label,
    module.resource,
    module.description,
    ...modulePermissions(module).flatMap((p) => [
      p.label,
      p.code,
      p.description ?? "",
    ]),
  ].some((text) => text.toLowerCase().includes(query))
}

/** Filters at module granularity — a query matching one permission still shows its whole
 *  module row (the row is the unit of action, not the individual cell), and drops any
 *  block left with no matching modules. */
export function filterPermissionBlocks(
  blocks: PermissionBlock[],
  query: string
): PermissionBlock[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return blocks

  return blocks
    .map((block) => ({
      ...block,
      modules: block.modules.filter((module) => moduleMatches(module, trimmed)),
    }))
    .filter((block) => block.modules.length > 0)
}

/** Every code across a list of modules — the whole set, or just one action's. Scoped to
 *  whatever `modules` list is passed in (e.g. the currently visible/filtered set) — used
 *  for both the block-level "select all" and the toolbar's bulk-grant presets. */
export function collectPermissionCodes(
  modules: PermissionModule[],
  action?: GridAction
): PermissionCode[] {
  if (action) {
    return modules
      .map((m) => m.byAction[action])
      .filter((p) => p !== undefined)
      .map((p) => p.code)
  }

  return modules.flatMap(modulePermissions).map((p) => p.code)
}
