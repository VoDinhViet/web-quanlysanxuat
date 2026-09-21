import { ArrowRightDown, ArrowRightUp, TrashBinTrash } from "@solar-icons/react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import type {
  BomCreateOptions,
  BomRow,
} from "@/features/products/utils/bom-rows.util"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItem } from "@/lib/types/bom-item.type"

const partLabel = bomItemTypeLabels.COMPONENT

// Chỉ còn tạo COMPONENT (con hoặc cùng cấp trong cây) và xoá — Sửa hạng mục
// giờ mở ở trang BomItemDetailPage (Xem chi tiết), không còn dialog Sửa riêng
// ở bảng cây nữa; vật tư (CONSUMABLE) cũng không tạo được từ bảng cây, chỉ tạo
// qua tab Vật tư trong trang chi tiết.
export type BomTableActions = {
  onCreate: (options: BomCreateOptions) => void
  onDelete: (bomItem: BomItem) => void
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
  row: BomRow
}) {
  if (row.bomItem === null) {
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

// "Thêm Part" — một nút duy nhất cho mỗi dòng (trước đây tách "Thêm Part con"/
// "Thêm Part cùng cấp" thành 2 nút riêng); dialog tự quyết định có hiện bước
// chọn vị trí (con/cùng cấp) hay không dựa vào `options.siblingTarget` (null
// với dòng Cấp 0). Icon luôn hiện, nhãn chữ chỉ hiện từ `xl` —
// Tooltip vẫn giữ để trạng thái co lại tự giải thích được (tiền lệ
// ProductionExecutionOperationsTable.tsx).
export function CreatePartAction({
  options,
  actions,
}: {
  options: BomCreateOptions
  actions: BomTableActions
}) {
  const label = `Thêm ${partLabel}`

  return (
    <PermissionGate permission="items:bom-manage">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="sm"
              aria-label={label}
              onClick={() => actions.onCreate(options)}
            >
              <ArrowRightDown className="size-3.5" />
              <span className="hidden xl:inline">{label}</span>
            </Button>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </PermissionGate>
  )
}

// Xoá — chỉ hợp lệ cho node COMPONENT/CONSUMABLE thật (dòng Cấp 0 không xoá
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
