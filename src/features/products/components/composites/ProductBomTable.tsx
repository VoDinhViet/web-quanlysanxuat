import { Fragment, useState } from "react"
import { Image } from "@unpic/react"
import {
  ArrowRightDown,
  Bolt,
  Gallery,
  InfoCircle,
  Layers,
  LayersMinimalistic,
  Route,
} from "@solar-icons/react"
import { FileText, Pencil, Plus, Trash2 } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconButton } from "@/components/shared/primitives/IconButton"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import {
  BomNodeTypeBadge,
  ProductTypeBadge,
} from "@/features/products/components/primitives/ProductBadges"
import { ProductOperationsPanel } from "@/features/products/components/composites/ProductOperationsPanel"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItem, BomItemType } from "@/lib/types/bom-item.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import { formatOperationSequence } from "@/lib/types/operation.type"
import type { Item } from "@/lib/types/item.type"
import { ItemType } from "@/lib/types/item.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

// Loại node mới không còn suy một chiều từ parentId — một bán thành phẩm
// (WIP) có thể chứa cả bán thành phẩm khác lẫn vật tư (RM), người dùng chọn
// qua menu "Thêm thành phần"/"Cấp con". Vật tư luôn là lá (backend E052) nên
// không có menu chọn loại con cho dòng RM. Gốc là thành phẩm (FG) vẫn chỉ
// nhận bán thành phẩm, giữ đúng ý nghĩa "thành phẩm lắp từ các cụm".

// The root row's own routing (Cấp 0) — fetched separately since the BOM GET
// only returns the tree's child nodes, not the product itself. Each BOM node
// carries its own `operations` directly (see BomItem in bom-item.type.ts), so
// no equivalent type is needed for child rows.
export type RootOperations = {
  operations: ProductOperation[]
  isPending: boolean
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

export type BomTableActions = {
  onCreate: (parentId: string | null, itemType: BomItemType) => void
  onUpdate: (node: BomItem) => void
  onDelete: (node: BomItem) => void
}

type FlatRow = {
  node: BomItem
  path: string
}

// GET .../bom returns a flat parent-child list (`parentId` links each node to
// its parent, `null` = top-level) — group by parent once, then walk it
// depth-first into a numbered, indented row list (path like "1.2").
function groupByParentId(nodes: BomItem[]): Map<string | null, BomItem[]> {
  const map = new Map<string | null, BomItem[]>()
  nodes.forEach((node) => {
    const siblings = map.get(node.parentId) ?? []
    siblings.push(node)
    map.set(node.parentId, siblings)
  })
  return map
}

function flattenNodes(
  childrenByParentId: Map<string | null, BomItem[]>,
  parentId: string | null,
  parentPath: string | null,
  rows: FlatRow[]
): void {
  const children = childrenByParentId.get(parentId) ?? []
  children.forEach((node, index) => {
    const path =
      parentPath === null ? `${index + 1}.0` : `${parentPath}.${index + 1}`
    rows.push({ node, path })
    if (childrenByParentId.has(node.id)) {
      flattenNodes(childrenByParentId, node.id, path, rows)
    }
  })
}

/**
 * Render Level badge (CẤP column) matching reference design:
 * Cấp 0: Green dot (● 0)
 * Cấp 1: Blue dot (● 1)
 * Cấp 2+: Yellow/Amber dot
 */
function LevelBadge({ level }: { level: number }) {
  if (level === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
        <span className="size-2 rounded-full bg-emerald-500" />0
      </span>
    )
  }
  if (level === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-400">
        <span className="size-2 rounded-full bg-blue-500" />1
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
      <span className="size-2 rounded-full bg-amber-500" />
      {level}
    </span>
  )
}

// Short usage hint above the tree — the table has no other on-screen
// explanation of the add/công đoạn affordances, so a first-time user has
// nothing to go on beyond the icon tooltips.
function BomTableGuidance() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <InfoCircle className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        Cây kết cấu (BOM) thể hiện các bán thành phẩm và vật tư lắp ráp nên sản
        phẩm — một bán thành phẩm có thể chứa bán thành phẩm khác hoặc vật tư,
        còn vật tư luôn là cấp cuối. Nhấn{" "}
        <span className="font-medium text-foreground">"+"</span> để thêm thành
        phần con, bấm biểu tượng công đoạn để xem hoặc chỉnh sửa quy trình sản
        xuất.
      </p>
    </div>
  )
}

// The CÔNG ĐOẠN cell: a plain read-only summary of the routing's sequence
// text. The full panel (add/move/delete controls) lives in its own row below,
// shown/hidden via the toggle button in THAO TÁC.
function OperationSummaryText({
  operations,
  isPending,
}: {
  operations: ProductOperation[]
  isPending: boolean
}) {
  if (isPending) {
    return <Skeleton className="h-4 w-16" />
  }

  return (
    <span className="text-xs font-medium text-foreground/80">
      {formatOperationSequence(operations)}
    </span>
  )
}

// Show/hide toggle for a row's own operations panel (root or WIP), living in
// THAO TÁC alongside its other actions — not gated by `products:bom-manage`
// since viewing an existing routing is a read, not a write (only the panel's
// add/move/delete controls require that permission).
function OperationsToggleButton({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <IconButton
      label={isExpanded ? "Ẩn công đoạn" : "Hiện công đoạn"}
      onClick={onToggle}
      className={cn(
        "border border-border/60 hover:bg-muted",
        isExpanded && "bg-primary/10 text-primary hover:bg-primary/15"
      )}
    >
      <Route className="size-3.5" />
    </IconButton>
  )
}

// Add entry point per row. A WIP row can nest either another WIP
// sub-assembly or an RM material underneath it, plus add a parallel sibling
// of its own type — all three collapse into one dropdown so there's a single
// "Thêm thành phần" affordance to learn. An RM row is always a leaf (backend
// E052), so it only ever gets the plain "Cùng cấp" button — no children to
// choose a type for.
function BomRowActions({
  node,
  onAddChild,
  onAddSibling,
  onUpdate,
  onDelete,
}: {
  node: BomItem
  onAddChild: (itemType: BomItemType) => void
  onAddSibling: () => void
  onUpdate: (node: BomItem) => void
  onDelete: (node: BomItem) => void
}) {
  return (
    <>
      {node.itemType === "WIP" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              label="Thêm thành phần"
              className="border border-border/60 hover:bg-muted"
            >
              <ArrowRightDown className="size-3.5" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuLabel>Thêm cấp con</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onAddChild("WIP")}>
              <LayersMinimalistic />
              {bomItemTypeLabels.WIP}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddChild("RM")}>
              <Bolt />
              {bomItemTypeLabels.RM}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onAddSibling}>
              <Layers />
              Cùng cấp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <IconButton
          label="Thêm cùng cấp"
          onClick={onAddSibling}
          className="border border-border/60 hover:bg-muted"
        >
          <Layers className="size-3.5" />
        </IconButton>
      )}

      <IconButton
        label="Sửa thành phần"
        onClick={() => onUpdate(node)}
        className="border border-border/60 hover:bg-muted"
      >
        <Pencil className="size-3.5" />
      </IconButton>

      <IconButton
        label="Xoá thành phần"
        className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(node)}
      >
        <Trash2 className="size-3.5" />
      </IconButton>
    </>
  )
}

// Root row's own "+". An FG root's tree always starts with a WIP
// sub-assembly, so the button adds one directly. A WIP root (this item is
// itself a sub-assembly, viewed on its own detail page) can attach either a
// nested WIP or an RM material straight at the top, so it expands into the
// same two-option menu as a WIP row's "Cấp con".
function RootAddButton({
  productType,
  onCreate,
}: {
  productType: ItemType
  onCreate: (itemType: BomItemType) => void
}) {
  if (productType === ItemType.FG) {
    return (
      <IconButton
        label="Thêm thành phần"
        onClick={() => onCreate("WIP")}
        className="border border-border/60 hover:bg-muted"
      >
        <Plus className="size-3.5" />
      </IconButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          label="Thêm thành phần"
          className="border border-border/60 hover:bg-muted"
        >
          <Plus className="size-3.5" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Thêm thành phần</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onCreate("WIP")}>
          <LayersMinimalistic />
          {bomItemTypeLabels.WIP}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onCreate("RM")}>
          <Bolt />
          {bomItemTypeLabels.RM}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ProductBomTableProps = {
  product: Item
  nodes: BomItem[]
  actions?: BomTableActions
  rootOperations: RootOperations
}

export function ProductBomTable({
  product,
  nodes,
  actions,
  rootOperations,
}: ProductBomTableProps) {
  // STT / MÃ BẢN VẼ / TÊN BẢN VẼ / LOẠI / CẤP / SỐ LƯỢNG / ĐVT / CÔNG ĐOẠN / THAO TÁC
  const columnCount = 9

  const [expandedOperationIds, setExpandedOperationIds] = useState<Set<string>>(
    new Set()
  )

  const childrenByParentId = groupByParentId(nodes)
  const rows: FlatRow[] = []
  flattenNodes(childrenByParentId, null, null, rows)

  function toggleOperationsExpanded(rowKey: string) {
    setExpandedOperationIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowKey)) {
        next.delete(rowKey)
      } else {
        next.add(rowKey)
      }
      return next
    })
  }

  const isRootOperationsExpanded = expandedOperationIds.has("root")

  return (
    <div className="space-y-3">
      <BomTableGuidance />

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="h-12 hover:bg-muted/45">
              <TableHead className="w-14">STT</TableHead>
              <TableHead className="w-48">MÃ BẢN VẼ</TableHead>
              <TableHead className="min-w-44">TÊN BẢN VẼ</TableHead>
              <TableHead className="w-28">LOẠI</TableHead>
              <TableHead className="w-20">CẤP</TableHead>
              <TableHead className="w-24 text-center">SỐ LƯỢNG</TableHead>
              <TableHead className="w-20">ĐVT</TableHead>
              <TableHead className="min-w-64">CÔNG ĐOẠN</TableHead>
              <TableHead className="w-44 text-right">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Item root row — "Cấp 0" */}
            <TableRow className="h-14 bg-muted/10">
              <TableCell className="font-mono font-bold text-foreground">
                0
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                    {product.image ? (
                      <Image
                        src={resolveFileUrl(product.image.url)}
                        alt={product.name}
                        layout="fullWidth"
                        objectFit="cover"
                        className="size-full"
                      />
                    ) : (
                      <Gallery className="size-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {product.code}
                  </span>
                </div>
              </TableCell>
              <TableCell
                className="max-w-48 truncate font-bold text-foreground"
                title={product.name}
              >
                {product.name}
              </TableCell>
              <TableCell>
                <ProductTypeBadge type={product.type} />
              </TableCell>
              <TableCell>
                <LevelBadge level={0} />
              </TableCell>
              <TableCell className="text-center font-semibold text-foreground tabular-nums">
                1
              </TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell
                className="max-w-64 truncate"
                title={formatOperationSequence(rootOperations.operations)}
              >
                <OperationSummaryText
                  operations={rootOperations.operations}
                  isPending={rootOperations.isPending}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <OperationsToggleButton
                    isExpanded={isRootOperationsExpanded}
                    onToggle={() => toggleOperationsExpanded("root")}
                  />
                  {actions !== undefined ? (
                    <PermissionGate permission="items:bom-manage">
                      <RootAddButton
                        productType={product.type}
                        onCreate={(itemType) =>
                          actions.onCreate(null, itemType)
                        }
                      />
                    </PermissionGate>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>

            {isRootOperationsExpanded ? (
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableCell colSpan={columnCount} className="p-0">
                  <ProductOperationsPanel
                    target={{ productId: product.id }}
                    operations={rootOperations.operations}
                    isPending={rootOperations.isPending}
                  />
                </TableCell>
              </TableRow>
            ) : null}

            {/* Child BOM rows — always fully expanded, no collapse toggle. */}
            {rows.map(({ node, path }) => {
              return (
                <Fragment key={node.id}>
                  <TableRow className="h-14">
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      {path}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1.5"
                        style={{ paddingLeft: `${(node.level - 1) * 16}px` }}
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                          {node.image ? (
                            <Image
                              src={resolveFileUrl(node.image.url)}
                              alt={node.name}
                              layout="fullWidth"
                              objectFit="cover"
                              className="size-full"
                            />
                          ) : (
                            <Gallery className="size-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {node.code}
                        </span>
                        {node.drawing ? (
                          <a
                            href={resolveFileUrl(node.drawing.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Xem bản vẽ"
                            title="Xem bản vẽ"
                          >
                            <FileText className="size-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-48 truncate font-semibold text-foreground"
                      title={node.name}
                    >
                      {node.name}
                    </TableCell>
                    <TableCell>
                      <BomNodeTypeBadge type={node.itemType} />
                    </TableCell>
                    <TableCell>
                      <LevelBadge level={node.level} />
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground tabular-nums">
                      {quantityFormatter.format(node.quantity)}
                    </TableCell>
                    <TableCell
                      className="font-medium text-muted-foreground"
                      title={node.unit.code}
                    >
                      {node.unit.name}
                    </TableCell>
                    <TableCell
                      className="max-w-64 truncate"
                      title={
                        node.itemType === "WIP"
                          ? formatOperationSequence(node.operations)
                          : undefined
                      }
                    >
                      {node.itemType === "WIP" ? (
                        <OperationSummaryText
                          operations={node.operations}
                          isPending={false}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {node.itemType === "WIP" ? (
                          <OperationsToggleButton
                            isExpanded={expandedOperationIds.has(node.id)}
                            onToggle={() => toggleOperationsExpanded(node.id)}
                          />
                        ) : null}
                        {actions !== undefined ? (
                          <PermissionGate permission="items:bom-manage">
                            <BomRowActions
                              node={node}
                              onAddChild={(itemType) =>
                                actions.onCreate(node.id, itemType)
                              }
                              onAddSibling={() =>
                                actions.onCreate(node.parentId, node.itemType)
                              }
                              onUpdate={actions.onUpdate}
                              onDelete={actions.onDelete}
                            />
                          </PermissionGate>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>

                  {node.itemType === "WIP" &&
                  expandedOperationIds.has(node.id) ? (
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableCell colSpan={columnCount} className="p-0">
                        <ProductOperationsPanel
                          target={{
                            productId: product.id,
                            bomItemId: node.id,
                          }}
                          operations={node.operations}
                          isPending={false}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
