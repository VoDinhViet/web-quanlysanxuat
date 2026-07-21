import { Fragment, useState } from "react"
import { Icon } from "@iconify/react"
import addSquareBold from "@iconify-icons/solar/add-square-bold"
import galleryRemoveBold from "@iconify-icons/solar/gallery-remove-bold"
import penBold from "@iconify-icons/solar/pen-bold"
import routingBold from "@iconify-icons/solar/routing-bold"
import trashBinTrashBold from "@iconify-icons/solar/trash-bin-trash-bold"
import { ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import {
  STRUCTURE_LEVEL_LABELS,
  STRUCTURE_LEVEL_STYLE,
} from "@/features/products/components/ProductStructureBadges"
import { ProductOperationsTable } from "@/features/products/components/ProductOperationsTable"
import { StructureNodeType } from "@/features/products/types/product-structure.type"
import type {
  ProductOperation,
  ProductStructureNode,
} from "@/features/products/types/product-structure.type"
import type { Product } from "@/features/products/types/product.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type FlatRow = {
  node: ProductStructureNode
  depth: number
  path: string
  hasChildren: boolean
}

// Flattens the tree into display rows in document order, skipping a node's
// children while it's collapsed. Numbering follows "1.0", "1.0.1", "1.0.2",
// "2.0" … — each level just appends its 1-based sibling index to the
// parent's own path string, so it falls out of the recursion for free.
function flattenNodes(
  nodes: ProductStructureNode[],
  depth: number,
  parentPath: string | null,
  expandedIds: Set<string>,
  rows: FlatRow[]
): void {
  nodes.forEach((node, index) => {
    const path =
      parentPath === null ? `${index + 1}.0` : `${parentPath}.${index + 1}`
    const hasChildren = node.children.length > 0
    rows.push({ node, depth, path, hasChildren })
    if (hasChildren && expandedIds.has(node.id)) {
      flattenNodes(node.children, depth + 1, path, expandedIds, rows)
    }
  })
}

function formatOperationsChain(operations: ProductOperation[]): string {
  if (operations.length === 0) return "—"
  return operations
    .map((operation) => `${operation.sequence}. ${operation.name}`)
    .join(" → ")
}

function StructureThumbnail({
  imageUrl,
  name,
}: {
  imageUrl: string | null
  name: string
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="size-7 shrink-0 rounded-md border border-border object-cover"
      />
    )
  }

  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30">
      <Icon
        icon={galleryRemoveBold}
        className="size-3 text-muted-foreground/40"
      />
    </div>
  )
}

type ProductStructureTableProps = {
  product: Product
  nodes: ProductStructureNode[]
  onAddChild: (parentId: string) => void
  onEditNode: (node: ProductStructureNode) => void
  onDeleteNode: (node: ProductStructureNode) => void
  onAddOperation: (nodeId: string) => void
  onEditOperation: (nodeId: string, operation: ProductOperation) => void
  onDeleteOperation: (nodeId: string, operationId: string) => void
}

// The whole BOM as one flat table — the product itself as the "Cấp 0" root
// row, then every structure node in document order, indented and numbered
// ("1.0", "1.0.1" …) by depth. A row's "Công đoạn" action expands its
// operations table inline, directly beneath that row — at most one node's
// operations open at a time.
export function ProductStructureTable({
  product,
  nodes,
  onAddChild,
  onEditNode,
  onDeleteNode,
  onAddOperation,
  onEditOperation,
  onDeleteOperation,
}: ProductStructureTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(nodes.map((node) => node.id))
  )
  // Which node's công đoạn table is expanded inline below its row — at most
  // one at a time, toggled by the row's "Công đoạn" action.
  const [operationsNodeId, setOperationsNodeId] = useState<string | null>(null)

  const rows: FlatRow[] = []
  flattenNodes(nodes, 1, null, expandedIds, rows)

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

  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="h-12 hover:bg-muted/45">
            <TableHead className="w-16">STT</TableHead>
            <TableHead>Mã bản vẽ</TableHead>
            <TableHead>Tên bản vẽ</TableHead>
            <TableHead className="w-16 text-center">Cấp</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead>ĐVT</TableHead>
            <TableHead>Công đoạn (thứ tự thực hiện)</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="h-14 bg-muted/15 hover:bg-muted/25">
            <TableCell className="font-mono font-semibold text-foreground">
              0
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <StructureThumbnail
                  imageUrl={
                    product.image ? resolveFileUrl(product.image.url) : null
                  }
                  name={product.name}
                />
                <span className="font-mono font-semibold text-foreground">
                  {product.code}
                </span>
              </div>
            </TableCell>
            <TableCell className="font-semibold text-foreground">
              {product.name}
            </TableCell>
            <TableCell className="text-center">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    STRUCTURE_LEVEL_STYLE.ROOT.dot
                  )}
                />
                0
              </span>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              1
            </TableCell>
            <TableCell className="text-muted-foreground">—</TableCell>
            <TableCell className="text-muted-foreground">—</TableCell>
            <TableCell />
          </TableRow>

          {rows.map(({ node, depth, path, hasChildren }) => {
            const isMaterial = node.type === StructureNodeType.MATERIAL
            const isExpanded = expandedIds.has(node.id)
            const operationsChain = isMaterial
              ? "—"
              : formatOperationsChain(node.operations)

            return (
              <Fragment key={node.id}>
                <TableRow className="h-14 bg-card hover:bg-muted/25">
                  <TableCell className="font-mono text-muted-foreground">
                    {path}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-1.5"
                      style={{ paddingLeft: `${(depth - 1) * 16}px` }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(node.id)}
                          className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
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
                      <StructureThumbnail
                        imageUrl={node.imageUrl}
                        name={node.name}
                      />
                      <span className="font-mono font-semibold text-foreground">
                        {node.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="max-w-48 truncate font-medium text-foreground"
                    title={node.name}
                  >
                    {node.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          STRUCTURE_LEVEL_STYLE[node.type].dot
                        )}
                      />
                      {depth}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {quantityFormatter.format(node.quantity)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {node.unit || "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-64 truncate text-muted-foreground"
                    title={
                      operationsChain !== "—" ? operationsChain : undefined
                    }
                  >
                    {operationsChain}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <PermissionGate permission="products:update">
                        {!isMaterial ? (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <IconButton
                                  label="Công đoạn"
                                  className={
                                    operationsNodeId === node.id
                                      ? "border-primary/40 bg-primary/10 text-primary"
                                      : undefined
                                  }
                                  onClick={() =>
                                    setOperationsNodeId((prev) =>
                                      prev === node.id ? null : node.id
                                    )
                                  }
                                >
                                  <Icon
                                    icon={routingBold}
                                    className="size-3.5"
                                  />
                                </IconButton>
                              </TooltipTrigger>
                              <TooltipContent>Công đoạn</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <IconButton
                                  label="Thêm hạng mục con"
                                  onClick={() => onAddChild(node.id)}
                                >
                                  <Icon
                                    icon={addSquareBold}
                                    className="size-3.5"
                                  />
                                </IconButton>
                              </TooltipTrigger>
                              <TooltipContent>Thêm hạng mục con</TooltipContent>
                            </Tooltip>
                          </>
                        ) : null}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Sửa hạng mục"
                              onClick={() => onEditNode(node)}
                            >
                              <Icon icon={penBold} className="size-3.5" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Xoá hạng mục"
                              className="text-destructive"
                              onClick={() => onDeleteNode(node)}
                            >
                              <Icon
                                icon={trashBinTrashBold}
                                className="size-3.5"
                              />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Xoá</TooltipContent>
                        </Tooltip>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>

                {operationsNodeId === node.id ? (
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableCell colSpan={8} className="py-3">
                      <div
                        style={{ paddingLeft: `${(depth - 1) * 16 + 24}px` }}
                      >
                        <p className="mb-2 text-[11px] font-semibold text-muted-foreground uppercase">
                          Công đoạn — {node.code} ·{" "}
                          {STRUCTURE_LEVEL_LABELS[node.type]}
                        </p>
                        <ProductOperationsTable
                          operations={node.operations}
                          onAdd={() => onAddOperation(node.id)}
                          onEdit={(operation) =>
                            onEditOperation(node.id, operation)
                          }
                          onDelete={(operationId) =>
                            onDeleteOperation(node.id, operationId)
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
