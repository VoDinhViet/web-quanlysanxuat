import {
  AddSquare,
  ArrowRightUp,
  Box,
  Layers,
  PenNewSquare,
  TrashBinTrash,
} from "@solar-icons/react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import type {
  BomCreateOptions,
  BomTree,
} from "@/features/products/utils/bom-tree"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItem } from "@/lib/types/bom-item.type"

const partLabel = bomItemTypeLabels.COMPONENT
const extraLabel = bomItemTypeLabels.DIRECT

// Chỉ còn tạo COMPONENT (con hoặc cùng cấp trong cây) và xoá — Sửa hạng mục
// giờ mở ở trang BomItemDetailPage (Xem chi tiết), không còn dialog Sửa riêng
// ở bảng cây nữa; vật tư (DIRECT) cũng không tạo được từ bảng cây, chỉ tạo
// qua tab Vật tư trong trang chi tiết.
export type BomTableActions = {
  onCreate: (options: BomCreateOptions) => void
  onDelete: (bomItem: BomItem) => void
  // Vật tư ngoài cấu trúc: `bomItemId` undefined = gắn cho sản phẩm chính (dòng Cấp 0).
  onCreateExtra: (bomItemId: string | undefined) => void
}

// "Xem chi tiết" mở trang BomItemDetailPage (thông tin, vật tư, công đoạn) —
// chỉ COMPONENT có trang chi tiết riêng; dòng Cấp 0 (`bomItem: null`, xem
// docs/decisions/level-0-outside-bom-tree-response.md) không có gì để chuyển
// tới — trang sản phẩm hiện tại đã là "trang chi tiết" của nó. Icon-only +
// Tooltip — hành động phụ, không cần nhãn chữ như CreatePartAction. Dùng
// ArrowRightUp (điều hướng) thay vì Eye — đây là chuyển trang, không phải xem
// nhanh tại chỗ.
export function ViewDetailAction({
  productId,
  row,
}: {
  productId: string
  row: BomTree
}) {
  if (row.bomItem === null || row.bomItem.isOffStructure) {
    return null
  }

  const label = `Xem chi tiết ${partLabel}`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <LinkButton
            to="/manage/products/$productId/bom/$bomItemId"
            params={{ productId, bomItemId: row.bomItem.id }}
            search={{ tab: "info" }}
            variant="outline"
            size="icon-sm"
            aria-label={label}
          >
            <ArrowRightUp className="size-3.5" />
          </LinkButton>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

// "Thêm" — một nút dropdown gộp "Thêm Part" và "Thêm vật tư" (trước đây 2 nút riêng
// cùng hàng, khó phân biệt). Dialog Part tự quyết định có hiện bước chọn vị trí
// (con/cùng cấp) hay không dựa vào `options.siblingTarget` (null với dòng Cấp 0);
// vật tư ngoài hiện như dòng con ngay dưới dòng này (Cấp 0 hoặc Part).
export function CreateActionsMenu({
  row,
  actions,
}: {
  row: BomTree
  actions: BomTableActions
}) {
  return (
    <PermissionGate permission="items:bom-manage">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm" aria-label="Thêm">
              <AddSquare className="size-3.5" />
              <span>Thêm</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
            Tùy chọn thêm mới
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={() => actions.onCreate(row.createOptions)}
            className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
          >
            <Box className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Thêm {partLabel}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Thành phần con hoặc cùng cấp
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.onCreateExtra(row.bomItem?.id)}
            className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
          >
            <Layers className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Thêm {extraLabel.toLowerCase()}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Vật tư ngoài cấu trúc
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGate>
  )
}

// Xoá — chỉ hợp lệ cho node COMPONENT/DIRECT thật (dòng Cấp 0 không xoá
// qua đây, xem ProductBomTableColumns.tsx).
export function DeletePartAction({
  bomItem,
  actions,
}: {
  bomItem: BomItem
  actions: BomTableActions
}) {
  const label = `Xoá ${partLabel}`

  return (
    <PermissionGate permission="items:bom-manage">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={label}
              className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => actions.onDelete(bomItem)}
            >
              <TrashBinTrash className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </PermissionGate>
  )
}

// Xoá một dòng vật tư trực tiếp — cũng là một node `bom_items` (`row.bomItem`), dùng chung hộp thoại xác nhận với Part.
export function DeleteDirectAction({
  row,
  actions,
}: {
  row: BomTree
  actions: BomTableActions
}) {
  const label = "Xoá vật tư"

  return (
    <PermissionGate permission="items:bom-manage">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={label}
              className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => actions.onDelete(row.bomItem!)}
            >
              <TrashBinTrash className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </PermissionGate>
  )
}

// "Chỉnh sửa vật tư" — mở trang UpdateDirectPage cho dòng vật tư trực tiếp ngoài cấu trúc.
export function EditDirectAction({ row }: { row: BomTree }) {
  const directId = row.bomItem?.itemId
  if (!directId) {
    return null
  }

  const label = "Chỉnh sửa vật tư"

  return (
    <RoutePermissionGate route="/manage/directs/$directId/update">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/directs/$directId/update"
              params={{ directId }}
              variant="outline"
              size="icon-sm"
              aria-label={label}
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <PenNewSquare className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </RoutePermissionGate>
  )
}

