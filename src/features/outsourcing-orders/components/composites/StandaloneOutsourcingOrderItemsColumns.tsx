import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"
import type { AnyFormApi } from "@tanstack/react-form"

import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StandaloneOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import type { SelectOption } from "@/lib/utils"

const standaloneOutsourcingOrderItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  StandaloneOutsourcingOrderItemValue
>()

type BuildStandaloneOutsourcingOrderItemColumnsArgs = {
  // FormApi giữ nguyên qua mọi render. Không nhận `useField` vì nó đổi object mỗi lần dòng đổi, làm
  // `columns` dựng lại: flexRender coi `cell` là component nên mọi ô remount, ô đang gõ mất focus.
  form: AnyFormApi
  onRemoveItem: (itemIndex: number) => void
  unitOptions: SelectOption[]
  isUnitsPending: boolean
  disabled: boolean
}

type RequiredHeaderProps = {
  label: string
}

function RequiredHeader({ label }: RequiredHeaderProps) {
  return (
    <>
      {label} <span className="text-destructive">*</span>
      <span className="sr-only">(bắt buộc)</span>
    </>
  )
}

// Mỗi ô chỉ ghi đúng field của nó (`items[i].x`), không ghi đè cả dòng bằng `row.original`: ô chữ
// commit khi blur nên bản dòng cũ trong closure có thể đè mất giá trị vừa nhập ở ô bên cạnh.
// Ô bắt buộc trống thì bước ③ còn khoá; trùng mã hàng hiện lỗi dưới bảng khi lưu.
export function buildStandaloneOutsourcingOrderItemColumns({
  form,
  onRemoveItem,
  unitOptions,
  isUnitsPending,
  disabled,
}: BuildStandaloneOutsourcingOrderItemColumnsArgs) {
  return standaloneOutsourcingOrderItemColumnHelper.columns([
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.index + 1}
        </span>
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "itemCode",
      header: () => <RequiredHeader label="Mã hàng" />,
      meta: { headerClassName: "w-44" },
      cell: ({ row }) => (
        <TableTextCellInput
          className="w-full"
          value={row.original.itemCode}
          aria-label={`Mã hàng dòng ${row.index + 1}`}
          placeholder="Mã hàng"
          maxLength={50}
          disabled={disabled}
          onValueChange={(itemCode) =>
            form.setFieldValue(`items[${row.index}].itemCode`, itemCode)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "itemName",
      header: () => <RequiredHeader label="Tên hàng" />,
      meta: { headerClassName: "min-w-48" },
      cell: ({ row }) => (
        <TableTextCellInput
          className="w-full"
          value={row.original.itemName}
          aria-label={`Tên hàng dòng ${row.index + 1}`}
          placeholder="Tên sản phẩm / chi tiết"
          maxLength={255}
          disabled={disabled}
          onValueChange={(itemName) =>
            form.setFieldValue(`items[${row.index}].itemName`, itemName)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "unit",
      header: () => <RequiredHeader label="ĐVT" />,
      meta: { headerClassName: "w-28" },
      cell: ({ row }) => (
        <Select
          items={unitOptions}
          value={row.original.unitId || null}
          onValueChange={(unitId) =>
            unitId !== null &&
            form.setFieldValue(`items[${row.index}].unitId`, unitId)
          }
          disabled={disabled}
        >
          <SelectTrigger
            size="sm"
            aria-label={`Đơn vị dòng ${row.index + 1}`}
            className="w-full bg-card text-xs"
          >
            <SelectValue
              placeholder={isUnitsPending ? "Đang tải..." : "Chọn"}
            />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "quantity",
      header: () => <RequiredHeader label="SL gửi" />,
      meta: { headerClassName: "w-24 text-right" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.quantity}
          aria-label={`SL gửi dòng ${row.index + 1}`}
          placeholder="0"
          disabled={disabled}
          onValueChange={(quantity) =>
            form.setFieldValue(`items[${row.index}].quantity`, quantity)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "weight",
      header: "Trọng lượng (kg)",
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.weight}
          aria-label={`Trọng lượng dòng ${row.index + 1}`}
          placeholder="—"
          disabled={disabled}
          onValueChange={(weight) =>
            form.setFieldValue(`items[${row.index}].weight`, weight)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "area",
      header: "Diện tích (m²)",
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => (
        <NumericCellInput
          value={row.original.area}
          aria-label={`Diện tích dòng ${row.index + 1}`}
          placeholder="—"
          disabled={disabled}
          onValueChange={(area) =>
            form.setFieldValue(`items[${row.index}].area`, area)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => (
        <TableTextCellInput
          className="w-full"
          value={row.original.note}
          aria-label={`Ghi chú dòng ${row.index + 1}`}
          placeholder="Ghi chú"
          maxLength={500}
          disabled={disabled}
          onValueChange={(note) =>
            form.setFieldValue(`items[${row.index}].note`, note)
          }
        />
      ),
    }),
    standaloneOutsourcingOrderItemColumnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Thao tác</span>,
      meta: { headerClassName: "w-12", cellClassName: "text-center" },
      cell: ({ row, table }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Bỏ dòng ${row.index + 1}`}
          className="text-muted-foreground hover:text-destructive"
          // Phiếu cần ít nhất một dòng.
          disabled={disabled || table.getRowModel().rows.length === 1}
          onClick={() => onRemoveItem(row.index)}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    }),
  ])
}
