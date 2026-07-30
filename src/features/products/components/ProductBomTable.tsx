import { Fragment, useState } from "react"
import { Image } from "@unpic/react"
import { Icon } from "@iconify/react"
import addSquareBold from "@iconify-icons/solar/add-square-bold"
import altArrowDownBold from "@iconify-icons/solar/alt-arrow-down-bold"
import altArrowUpBold from "@iconify-icons/solar/alt-arrow-up-bold"
import exportBold from "@iconify-icons/solar/export-bold"
import homeBold from "@iconify-icons/solar/home-bold"
import routeBold from "@iconify-icons/solar/route-bold"
import trashBinTrashBold from "@iconify-icons/solar/trash-bin-trash-bold"
import { cva } from "class-variance-authority"
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
import type { IconifyIcon } from "@iconify/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
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
import { ComboboxField } from "@/components/shared/ComboboxField"
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useGetOperationOptions } from "@/features/operations/api"
import { useProductOperations } from "@/features/products/hooks/use-product-operations"
import { BomItemType } from "@/lib/types/bom-item.type"
import type { BomItem } from "@/lib/types/bom-item.type"
import {
  formatOperationSequence,
  OperationType,
} from "@/lib/types/operation.type"
import type { Operation } from "@/lib/types/operation.type"
import type { Product } from "@/lib/types/product.type"
import { useHasPermission } from "@/hooks/use-permissions"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

// The read-only routing snapshot for one BOM row's drawing: the current
// product for the root row, or the row's own itemId for a "Sản phẩm"-type
// BOM line (a sub-assembly with its own productId, and thus its own
// separate routing).
export type OperationsByProductId = Record<
  string,
  { operations: Operation[]; isPending: boolean }
>

const quantityFormatter = new Intl.NumberFormat("vi-VN")

function formatQuantity(quantity: string): string {
  const parsed = Number(quantity)
  return Number.isFinite(parsed) ? quantityFormatter.format(parsed) : "—"
}

export type BomTableActions = {
  onCreate: (parentId: string | null) => void
  onUpdate: (node: BomItem) => void
  onDelete: (node: BomItem) => void
}

type FlatRow = {
  node: BomItem
  path: string
}

function flattenNodes(
  nodes: BomItem[],
  parentPath: string | null,
  expandedIds: Set<string>,
  rows: FlatRow[]
): void {
  nodes.forEach((node, index) => {
    const path =
      parentPath === null ? `${index + 1}.0` : `${parentPath}.${index + 1}`
    rows.push({ node, path })
    if (node.children.length > 0 && expandedIds.has(node.id)) {
      flattenNodes(node.children, path, expandedIds, rows)
    }
  })
}

/**
 * Render Level badge (CẤP column) matching reference design:
 * Cấp 0: Green dot (● 0)
 * Cấp 1: Blue dot (● 1)
 * Cấp 2: Yellow/Amber dot (● 2) for PRODUCT, Grey dot for MATERIAL/hardware
 */
function LevelBadge({
  level,
  itemType,
}: {
  level: number
  itemType?: BomItemType
}) {
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
  if (itemType === BomItemType.MATERIAL) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
        <span className="size-2 rounded-full bg-slate-400" />
        {level}
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

type OperationTypeContent = {
  label: string
  icon: IconifyIcon
}

// Tint recipe mirrors SuppliersTableColumns' status badges: shadcn Badge
// (variant="outline") + a bg-<token>/15 text-<token> tint. Read-only — an
// operation's type belongs to the master catalog entry, not to this routing step.
const operationTypeBadgeVariants = cva("", {
  variants: {
    type: {
      INHOUSE: "bg-primary/15 text-primary",
      OUTSOURCE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
  },
})

// Label and icon aren't badge styling, so they stay a plain map rather than
// being folded into the cva above.
const OPERATION_TYPE_CONTENT: Record<OperationType, OperationTypeContent> = {
  INHOUSE: { label: "Inhouse", icon: homeBold },
  OUTSOURCE: { label: "Outsource", icon: exportBold },
}

function OperationTypeBadge({ type }: { type: OperationType }) {
  const { label, icon } = OPERATION_TYPE_CONTENT[type]
  return (
    <Badge variant="outline" className={operationTypeBadgeVariants({ type })}>
      <Icon icon={icon} className="size-3" />
      {label}
    </Badge>
  )
}

// The CÔNG ĐOẠN cell: a plain read-only summary of the routing's sequence
// text. Non-"Sản phẩm" rows (materials/hardware) have no routing at all, so
// they render a plain "—" instead — see the two call sites below. Expanding
// the row's own operations panel is done from THAO TÁC (OperationsToggleButton
// below), not from here.
function OperationSummaryText({
  operations,
  isPending,
}: {
  operations: Operation[]
  isPending: boolean
}) {
  if (isPending) {
    return <span className="text-xs text-muted-foreground/50">…</span>
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
      <Icon icon={routeBold} className="size-3.5" />
    </IconButton>
  )
}

// The expanded panel beneath a "Sản phẩm"-type row: a table of that
// product's own routing steps (STT / Công đoạn / Loại / Ghi chú), styled
// like the outer BOM table above it, plus the add-step form when the viewer
// can manage it. Owns its own writes via
// `useProductOperations(productId, ...)` — safe to call unconditionally
// here because this component only mounts while its row is expanded, so the
// call count for any given table row instance never changes across renders.
function ProductOperationsPanel({
  productId,
  operations,
  isPending,
}: {
  productId: string
  operations: Operation[]
  isPending: boolean
}) {
  const canManage = useHasPermission("products:bom-manage")
  const { addOperation, moveOperation, deleteOperation } = useProductOperations(
    productId,
    operations
  )
  const [typeFilter, setTypeFilter] = useState<OperationType>(
    OperationType.INHOUSE
  )
  const operationPicker = useGetOperationOptions(typeFilter)
  const [selectedOperationId, setSelectedOperationId] = useState<
    string | undefined
  >(undefined)
  const [note, setNote] = useState("")

  function handleAdd() {
    if (!selectedOperationId) return
    addOperation(selectedOperationId, note.trim() || undefined)
    setSelectedOperationId(undefined)
    setNote("")
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="size-5" />
      </div>
    )
  }

  const columnCount = canManage ? 5 : 4

  return (
    <div className="overflow-x-auto rounded-md border border-border/60 bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
            <TableHead className="w-14 font-bold text-foreground">
              STT
            </TableHead>
            <TableHead className="font-bold text-foreground">
              CÔNG ĐOẠN
            </TableHead>
            <TableHead className="w-36 font-bold text-foreground">
              LOẠI
            </TableHead>
            <TableHead className="font-bold text-foreground">GHI CHÚ</TableHead>
            <PermissionGate permission="products:bom-manage">
              <TableHead className="w-28 text-right font-bold text-foreground">
                THAO TÁC
              </TableHead>
            </PermissionGate>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.length === 0 && !canManage ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="py-6 text-center text-muted-foreground"
              >
                Chưa có công đoạn nào.
              </TableCell>
            </TableRow>
          ) : (
            operations.map((step, idx) => (
              <TableRow
                key={step.id}
                className="h-14 bg-card hover:bg-muted/20"
              >
                <TableCell className="font-mono font-bold text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {step.operation.name}
                </TableCell>
                <TableCell>
                  <OperationTypeBadge type={step.operation.type} />
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">
                  {step.note ?? "—"}
                </TableCell>
                <PermissionGate permission="products:bom-manage">
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <IconButton
                        label="Di chuyển lên"
                        disabled={idx === 0}
                        onClick={() => moveOperation(idx, "up")}
                        className="border border-border/60 hover:bg-muted"
                      >
                        <Icon icon={altArrowUpBold} className="size-3.5" />
                      </IconButton>
                      <IconButton
                        label="Di chuyển xuống"
                        disabled={idx === operations.length - 1}
                        onClick={() => moveOperation(idx, "down")}
                        className="border border-border/60 hover:bg-muted"
                      >
                        <Icon icon={altArrowDownBold} className="size-3.5" />
                      </IconButton>
                      <IconButton
                        label="Xoá công đoạn"
                        onClick={() => deleteOperation(step.id)}
                        className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Icon icon={trashBinTrashBold} className="size-3.5" />
                      </IconButton>
                    </div>
                  </TableCell>
                </PermissionGate>
              </TableRow>
            ))
          )}

          <PermissionGate permission="products:bom-manage">
            <TableRow className="h-14 bg-card hover:bg-muted/20">
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell>
                <ComboboxField
                  value={selectedOperationId}
                  onValueChange={setSelectedOperationId}
                  options={operationPicker.options}
                  onSearchChange={operationPicker.onSearchChange}
                  isPending={operationPicker.isFetching}
                  emptyMessage="Không tìm thấy công đoạn"
                  placeholder="Chọn công đoạn..."
                />
              </TableCell>
              <TableCell>
                <Select
                  value={typeFilter}
                  onValueChange={(next) => setTypeFilter(next as OperationType)}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INHOUSE">Inhouse</SelectItem>
                    <SelectItem value="OUTSOURCE">Outsource</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tuỳ chọn)"
                  className="h-9 text-xs"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  disabled={!selectedOperationId}
                  onClick={handleAdd}
                >
                  <Icon icon={addSquareBold} className="size-3.5" />
                  Thêm
                </Button>
              </TableCell>
            </TableRow>
          </PermissionGate>
        </TableBody>
      </Table>
    </div>
  )
}

// Add entry point — a "+" per row. A PRODUCT row can host children, so it
// offers a menu (con / cùng cấp); a MATERIAL row cannot (backend rejects with
// `bom_item.error.parent_is_material`), so its "+" only adds a sibling.
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
      {node.itemType === BomItemType.PRODUCT ? (
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
            <DropdownMenuItem onSelect={onAddChild}>
              <CornerDownRight />
              Cấp con
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddSibling}>
              <LayersPlus />
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
          <Plus className="size-3.5" />
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

type ProductBomTableProps = {
  product: Product
  nodes: BomItem[]
  actions?: BomTableActions
  operationsByProductId: OperationsByProductId
}

export function ProductBomTable({
  product,
  nodes,
  actions,
  operationsByProductId,
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

  const rows: FlatRow[] = []
  flattenNodes(nodes, null, expandedIds, rows)

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
        <PermissionGate permission="products:bom-manage">
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
                title={formatOperationSequence(
                  operationsByProductId[product.id].operations
                )}
              >
                <OperationSummaryText
                  operations={operationsByProductId[product.id].operations}
                  isPending={operationsByProductId[product.id].isPending}
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
                    productId={product.id}
                    operations={operationsByProductId[product.id].operations}
                    isPending={operationsByProductId[product.id].isPending}
                  />
                </TableCell>
              </TableRow>
            ) : null}

            {/* Child BOM rows */}
            {rows.map(({ node, path }) => {
              const hasChildren = node.children.length > 0
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
                      <LevelBadge level={node.level} itemType={node.itemType} />
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground tabular-nums">
                      {formatQuantity(node.quantity)}
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
                        node.itemType === BomItemType.PRODUCT
                          ? formatOperationSequence(
                              operationsByProductId[node.itemId].operations
                            )
                          : undefined
                      }
                    >
                      {node.itemType === BomItemType.PRODUCT ? (
                        <OperationSummaryText
                          operations={
                            operationsByProductId[node.itemId].operations
                          }
                          isPending={
                            operationsByProductId[node.itemId].isPending
                          }
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {node.itemType === BomItemType.PRODUCT ? (
                          <OperationsToggleButton
                            isExpanded={isOperationsExpanded}
                            onToggle={() => toggleOperationsExpanded(node.id)}
                          />
                        ) : null}
                        {actions !== undefined ? (
                          <PermissionGate permission="products:bom-manage">
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

                  {node.itemType === BomItemType.PRODUCT &&
                  isOperationsExpanded ? (
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableCell colSpan={columnCount} className="p-0">
                        <ProductOperationsPanel
                          productId={node.itemId}
                          operations={
                            operationsByProductId[node.itemId].operations
                          }
                          isPending={
                            operationsByProductId[node.itemId].isPending
                          }
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
