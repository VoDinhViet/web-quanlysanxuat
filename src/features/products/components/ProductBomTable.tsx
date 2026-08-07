import { Fragment, useState } from "react"
import { Image } from "@unpic/react"
import { Route } from "@solar-icons/react"
import {
  ChevronRight,
  CornerDownRight,
  FileText,
  ImageOff,
  LayersPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { BomNodeTypeBadge } from "@/features/products/components/ProductBadges"
import { ProductOperationsPanel } from "@/features/products/components/ProductOperationsPanel"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import { formatOperationSequence } from "@/lib/types/operation.type"
import type { Product } from "@/lib/types/product.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

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
  onCreate: (parentId: string | null) => void
  onUpdate: (node: BomItem) => void
  onDelete: (node: BomItem) => void
}

type FlatRow = {
  node: BomItem
  path: string
}

// GET .../bom returns a flat parent-child list (`parentId` links each node to
// its parent, `null` = top-level) — group by parent once, then walk it
// depth-first into a numbered, indented row list (path like "1.2"), same idiom
// as `buildBomRows` in ProductionJobBomTab.tsx.
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
  expandedIds: Set<string>,
  rows: FlatRow[]
): void {
  const children = childrenByParentId.get(parentId) ?? []
  children.forEach((node, index) => {
    const path =
      parentPath === null ? `${index + 1}.0` : `${parentPath}.${index + 1}`
    rows.push({ node, path })
    if (childrenByParentId.has(node.id) && expandedIds.has(node.id)) {
      flattenNodes(childrenByParentId, node.id, path, expandedIds, rows)
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

// The CÔNG ĐOẠN cell: a plain read-only summary of the routing's sequence
// text. Expanding the row's own operations panel is done from THAO TÁC
// (OperationsToggleButton below), not from here.
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

// Show/hide toggle for a "Sản phẩm"-type row's operations panel, living in
// THAO TÁC alongside the row's other actions — not gated by
// `products:bom-manage` since viewing an existing routing is a read, not a
// write (only the panel's add/move/delete controls require that permission).
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

// Add entry point — a "+" per row. A WIP row can host children ("Cấp con")
// alongside adding a sibling ("Cùng cấp"); an RM row is always a leaf
// (backend E052), so it only ever offers "Cùng cấp".
function BomRowActions({
  node,
  onAddChild,
  onAddSibling,
  onUpdate,
  onDelete,
}: {
  node: BomItem
  onAddChild: () => void
  onAddSibling: () => void
  onUpdate: (node: BomItem) => void
  onDelete: (node: BomItem) => void
}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            label="Thêm thành phần"
            className="border border-border/60 hover:bg-muted"
          >
            <Plus className="size-3.5" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* "Thêm" is already implied by the "+" trigger — just say where. */}
          {node.itemType === "WIP" ? (
            <DropdownMenuItem onSelect={onAddChild}>
              <CornerDownRight />
              Cấp con
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={onAddSibling}>
            <LayersPlus />
            Cùng cấp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

type ProductBomTableProps = {
  product: Product
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
  // STT / MÃ BẢN VẼ / TÊN BẢN VẼ / CẤP / SỐ LƯỢNG / ĐVT / CÔNG ĐOẠN / THAO TÁC —
  // THAO TÁC always renders now since every "Sản phẩm"-type row's operations
  // toggle lives there regardless of `products:bom-manage`.
  const columnCount = 8

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(nodes.map((node) => node.id))
  )
  const [expandedOperationIds, setExpandedOperationIds] = useState<Set<string>>(
    new Set()
  )

  const childrenByParentId = groupByParentId(nodes)
  const rows: FlatRow[] = []
  flattenNodes(childrenByParentId, null, null, expandedIds, rows)

  function toggleExpanded(nodeId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

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
    <div className="flex flex-col gap-2">
      {actions !== undefined ? (
        <PermissionGate permission="items:bom-manage">
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => actions.onCreate(null)}
            >
              <Plus className="size-3.5" />
              Thêm thành phần
            </Button>
          </div>
        </PermissionGate>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border/60 bg-card shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
              <TableHead className="w-14 font-bold text-foreground">
                STT
              </TableHead>
              <TableHead className="w-48 font-bold text-foreground">
                MÃ BẢN VẼ
              </TableHead>
              <TableHead className="min-w-44 font-bold text-foreground">
                TÊN BẢN VẼ
              </TableHead>
              <TableHead className="w-20 font-bold text-foreground">
                CẤP
              </TableHead>
              <TableHead className="w-24 text-center font-bold text-foreground">
                SỐ LƯỢNG
              </TableHead>
              <TableHead className="w-20 font-bold text-foreground">
                ĐVT
              </TableHead>
              <TableHead className="min-w-64 font-bold text-foreground">
                CÔNG ĐOẠN
              </TableHead>
              <TableHead className="w-44 text-right font-bold text-foreground">
                THAO TÁC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Product root row — "Cấp 0" */}
            <TableRow className="h-14 bg-muted/10 hover:bg-muted/20">
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
                      <ImageOff className="size-3.5 text-muted-foreground/50" />
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

            {/* Child BOM rows */}
            {rows.map(({ node, path }) => {
              const hasChildren = childrenByParentId.has(node.id)
              const isExpanded = expandedIds.has(node.id)
              const isOperationsExpanded = expandedOperationIds.has(node.id)

              return (
                <Fragment key={node.id}>
                  <TableRow className="h-14 bg-card hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      {path}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1.5"
                        style={{ paddingLeft: `${(node.level - 1) * 16}px` }}
                      >
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(node.id)}
                            className="flex size-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                          >
                            <ChevronRight
                              className={cn(
                                "size-3.5 transition-transform",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </button>
                        ) : (
                          <span className="size-5 shrink-0" />
                        )}
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
                            <ImageOff className="size-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {node.code}
                        </span>
                        <BomNodeTypeBadge
                          type={node.itemType}
                          className="text-[10px]"
                        />
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
                            isExpanded={isOperationsExpanded}
                            onToggle={() => toggleOperationsExpanded(node.id)}
                          />
                        ) : null}
                        {actions !== undefined ? (
                          <PermissionGate permission="items:bom-manage">
                            <BomRowActions
                              node={node}
                              onAddChild={() => {
                                // A leaf PRODUCT row starts collapsed (no
                                // children yet) with no expand chevron — expand
                                // it now so the newly-added child is visible
                                // once the dialog closes and the tree refetches.
                                setExpandedIds((prev) =>
                                  new Set(prev).add(node.id)
                                )
                                actions.onCreate(node.id)
                              }}
                              onAddSibling={() =>
                                actions.onCreate(node.parentId)
                              }
                              onUpdate={actions.onUpdate}
                              onDelete={actions.onDelete}
                            />
                          </PermissionGate>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>

                  {node.itemType === "WIP" && isOperationsExpanded ? (
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
