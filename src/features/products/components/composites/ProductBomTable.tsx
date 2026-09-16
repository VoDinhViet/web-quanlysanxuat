import { Fragment } from "react"
import { Image } from "@unpic/react"
import { ArrowRightDown, Gallery, InfoCircle, Layers } from "@solar-icons/react"
import { Eye, FileText, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
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
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { Item } from "@/lib/types/item.type"
import { resolveFileUrl } from "@/lib/file-url"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Chỉ còn tạo COMPONENT (con trực tiếp trong cây) và xoá — Sửa hạng mục giờ mở ở
// trang BomItemDetailPage (Xem chi tiết), không còn dialog Sửa riêng ở bảng
// cây nữa; vật tư (CONSUMABLE) cũng không tạo được từ bảng cây, chỉ tạo qua tab Vật
// tư trong trang chi tiết.
export type BomTableActions = {
  onCreate: (parentId: string | null) => void
  onDelete: (bomItem: BomItem) => void
}

type FlatRow = {
  bomItem: BomItem
  path: string
}

// GET .../bom returns a flat parent-child list (`parentId` links each node to
// its parent) — group COMPONENT/CONSUMABLE children by parent once, then walk it
// depth-first into a numbered, indented row list (path like "1.2"). CONSUMABLE leaves
// never appear here — consumables only render inside a BomItem's detail sheet
// (Vật tư tab), not in the tree itself.
function groupPartsByParentId(nodes: BomItem[]): Map<string, BomItem[]> {
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
  rows: FlatRow[]
): void {
  const children = childrenByParentId.get(parentId) ?? []
  children.forEach((bomItem, index) => {
    const path = `${parentPath}.${index + 1}`
    rows.push({ bomItem, path })
    flattenChildren(childrenByParentId, bomItem.id, path, rows)
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
// explanation of the add/xem-chi-tiết affordances, so a first-time user has
// nothing to go on beyond the icon tooltips.
function BomTableGuidance() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <InfoCircle className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        Cây kết cấu (BOM) thể hiện các cấu trúc con lắp ráp nên sản phẩm — một
        cấu trúc con có thể chứa cấu trúc con khác. Nhấn{" "}
        <span className="font-medium text-foreground">"+"</span> để thêm cấp
        con, bấm biểu tượng mắt để mở trang chi tiết vật tư và công đoạn của một
        dòng.
      </p>
    </div>
  )
}

// THAO TÁC cho một dòng bất kỳ (ROOT hoặc COMPONENT): "Xem chi tiết" mở trang
// BomItemDetailPage (thông tin, vật tư, công đoạn), "+" thêm cấp con (luôn
// tạo COMPONENT — vật tư giờ thêm ở trang chi tiết, không qua đây nữa).
function ViewAndAddActions({
  productId,
  bomItem,
  actions,
}: {
  productId: string
  bomItem: BomItem
  actions?: BomTableActions
}) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/products/$productId/bom/$bomItemId"
              params={{ productId, bomItemId: bomItem.id }}
              search={{ tab: "info" }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="border border-border/60 hover:bg-muted"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>

      {actions !== undefined ? (
        <PermissionGate permission="items:bom-manage">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Thêm cấp con"
                  onClick={() => actions.onCreate(bomItem.id)}
                  className="border border-border/60 hover:bg-muted"
                >
                  <ArrowRightDown className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>Thêm cấp con</TooltipContent>
          </Tooltip>
        </PermissionGate>
      ) : null}
    </>
  )
}

// Thêm-cùng-cấp/Xoá — chỉ hợp lệ cho node COMPONENT (ROOT không xoá qua đây,
// không có "cùng cấp" vì luôn đúng 1 dòng ROOT mỗi BOM). Sửa không còn ở
// đây — mở ở trang BomItemDetailPage qua "Xem chi tiết" thay vì một dialog
// thứ hai riêng cho hành động này.
function PartRowActions({
  bomItem,
  actions,
}: {
  bomItem: BomItem
  actions: BomTableActions
}) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Thêm cùng cấp"
              onClick={() => actions.onCreate(bomItem.parentId)}
              className="border border-border/60 hover:bg-muted"
            >
              <Layers className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>Thêm cùng cấp</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Xoá thành phần"
              className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => actions.onDelete(bomItem)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>Xoá thành phần</TooltipContent>
      </Tooltip>
    </>
  )
}

// Ảnh + mã/tên dùng chung cho cả dòng ROOT và dòng COMPONENT — image/code/revision
// đọc từ BomItem (ROOT join qua item liên kết như CONSUMABLE, xem bom-item.type.ts).
function BomItemCodeCell({
  bomItem,
  indent,
}: {
  bomItem: BomItem
  indent: number
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ paddingLeft: `${indent * 16}px` }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
        {bomItem.image ? (
          <Image
            src={resolveFileUrl(bomItem.image.url)}
            alt={bomItem.name}
            layout="fullWidth"
            objectFit="cover"
            className="size-full"
          />
        ) : (
          <Gallery className="size-3.5 text-muted-foreground/50" />
        )}
      </div>
      <span className="font-mono font-bold text-foreground">
        {bomItem.revision
          ? `${bomItem.code} · ${bomItem.revision}`
          : bomItem.code}
      </span>
      {bomItem.drawing ? (
        <a
          href={resolveFileUrl(bomItem.drawing.url)}
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
  )
}

// Sản phẩm chưa có BOM nào (chưa từng ghi node đầu tiên) — backend chưa sinh
// ROOT (docs/workflows/product-setup.md), nên hiển thị tạm từ `product` với
// đúng một hành động: thêm thành phần con đầu tiên.
function EmptyRootRow({
  product,
  actions,
}: {
  product: Item
  actions?: BomTableActions
}) {
  return (
    <TableRow id="root-empty" className="h-14 bg-muted/10">
      <TableCell className="font-mono font-bold text-foreground">0</TableCell>
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
            {product.code} · {product.revision}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-48">
        <span
          className="block truncate font-bold text-foreground"
          title={product.name}
        >
          {product.name}
        </span>
      </TableCell>
      <TableCell>
        <LevelBadge level={0} />
      </TableCell>
      <TableCell className="text-center font-semibold text-foreground tabular-nums">
        1
      </TableCell>
      <TableCell className="text-muted-foreground">—</TableCell>
      <TableCell className="text-right">
        {actions !== undefined ? (
          <div className="flex justify-end gap-1">
            <PermissionGate permission="items:bom-manage">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Thêm thành phần"
                      onClick={() => actions.onCreate(null)}
                      className="border border-border/60 hover:bg-muted"
                    >
                      <ArrowRightDown className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Thêm thành phần</TooltipContent>
              </Tooltip>
            </PermissionGate>
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  )
}

type ProductBomTableProps = {
  product: Item
  nodes: BomItem[]
  actions?: BomTableActions
}

export function ProductBomTable({
  product,
  nodes,
  actions,
}: ProductBomTableProps) {
  const rootItem = nodes.find((bomItem) => bomItem.type === "ROOT")
  const rows: FlatRow[] = []
  if (rootItem) {
    flattenChildren(groupPartsByParentId(nodes), rootItem.id, "0", rows)
  }

  return (
    <div className="space-y-3">
      <BomTableGuidance />

      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table aria-label="Cây kết cấu sản phẩm">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableRow>
              <TableHead className="w-14">STT</TableHead>
              <TableHead className="w-48">MÃ BẢN VẼ</TableHead>
              <TableHead className="min-w-44">TÊN BẢN VẼ</TableHead>
              <TableHead className="w-20">CẤP</TableHead>
              <TableHead className="w-24 text-center">SỐ LƯỢNG</TableHead>
              <TableHead className="w-20">ĐVT</TableHead>
              <TableHead className="w-32 text-right">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rootItem ? (
              <TableRow id={rootItem.id} className="h-14 bg-muted/10">
                <TableCell className="font-mono font-bold text-foreground">
                  0
                </TableCell>
                <TableCell>
                  <BomItemCodeCell bomItem={rootItem} indent={0} />
                </TableCell>
                <TableCell className="max-w-48">
                  <span
                    className="block truncate font-bold text-foreground"
                    title={rootItem.name}
                  >
                    {rootItem.name}
                  </span>
                </TableCell>
                <TableCell>
                  <LevelBadge level={0} />
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground tabular-nums">
                  1
                </TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <ViewAndAddActions
                      productId={product.id}
                      bomItem={rootItem}
                      actions={actions}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <EmptyRootRow product={product} actions={actions} />
            )}

            {rows.map(({ bomItem, path }) => (
              <Fragment key={bomItem.id}>
                <TableRow id={bomItem.id} className="h-14">
                  <TableCell className="font-mono font-bold text-muted-foreground">
                    {path}
                  </TableCell>
                  <TableCell>
                    <BomItemCodeCell
                      bomItem={bomItem}
                      indent={bomItem.level - 1}
                    />
                  </TableCell>
                  <TableCell className="max-w-48">
                    <span
                      className="block truncate font-semibold text-foreground"
                      title={bomItem.name}
                    >
                      {bomItem.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <LevelBadge level={bomItem.level} />
                  </TableCell>
                  <TableCell className="text-center font-semibold text-foreground tabular-nums">
                    {quantityFormatter.format(bomItem.quantity)}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {bomItem.unit ? (
                      <span title={bomItem.unit.code}>{bomItem.unit.name}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ViewAndAddActions
                        productId={product.id}
                        bomItem={bomItem}
                        actions={actions}
                      />
                      {actions !== undefined ? (
                        <PermissionGate permission="items:bom-manage">
                          <PartRowActions bomItem={bomItem} actions={actions} />
                        </PermissionGate>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
