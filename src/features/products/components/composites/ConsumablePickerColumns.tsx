import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

// Shape an CONSUMABLE `Consumable` row satisfies — the only picker for a BOM node's linked item now that
// COMPONENT nodes take a typed code/name instead (docs/decisions/wip-removal.md).
export type ConsumablePickerRow = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
  client: { name: string } | null
}

// Số lượng/ghi chú cho một dòng đã chọn — chỉ tồn tại trong `picked` khi dòng đó được tích chọn.
export type PickedConsumableValue = {
  quantity: string
  note: string
}

const consumablePickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ConsumablePickerRow
>()

type BuildConsumablePickerColumnsArgs = {
  picked: Map<string, PickedConsumableValue>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: ConsumablePickerRow) => void
  onToggleAll: (checked: boolean) => void
  onQuantityChange: (id: string, quantity: string) => void
  onNoteChange: (id: string, note: string) => void
}

// Chọn nhiều vật tư cùng lúc (checkbox, thay cho chọn đơn trước đây) — Số lượng/Ghi chú nhập
// ngay tại dòng thay vì một form riêng bên dưới bảng, chỉ hiện khi dòng đó đã được tích. Own
// useReactTable columns, mirroring the repo's other checkbox-column pickers (e.g.
// PurchaseRequestCreateConsumablePickerColumns.tsx) — no shared "select column" helper exists,
// every one of these tables closes over its own checked/disabled state.
export function buildConsumablePickerColumns({
  picked,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
  onQuantityChange,
  onNoteChange,
}: BuildConsumablePickerColumnsArgs) {
  return consumablePickerColumnHelper.columns([
    consumablePickerColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allChecked}
          disabled={disabled}
          onCheckedChange={onToggleAll}
          aria-label="Chọn tất cả trang này"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          checked={picked.has(row.original.id)}
          disabled={disabled}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.name}`}
        />
      ),
    }),
    consumablePickerColumnHelper.display({
      id: "item",
      header: "Mã / Tên",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
            {row.original.image ? (
              <Image
                src={resolveFileUrl(row.original.image.url)}
                alt={row.original.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <Gallery className="size-3 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-foreground">
              {row.original.code}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.name}
            </p>
          </div>
        </div>
      ),
    }),
    consumablePickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    consumablePickerColumnHelper.accessor((row) => row.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    consumablePickerColumnHelper.display({
      id: "quantity",
      header: "Số lượng",
      meta: { headerClassName: "w-28" },
      cell: ({ row }) => {
        const value = picked.get(row.original.id)
        if (!value) return <span className="text-muted-foreground">—</span>

        return (
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            className="h-8 text-xs"
            value={value.quantity}
            disabled={disabled}
            onChange={(event) =>
              onQuantityChange(row.original.id, event.target.value)
            }
          />
        )
      },
    }),
    consumablePickerColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "min-w-36" },
      cell: ({ row }) => {
        const value = picked.get(row.original.id)
        if (!value) return <span className="text-muted-foreground">—</span>

        return (
          <Input
            className="h-8 text-xs"
            placeholder="Ghi chú (nếu có)..."
            value={value.note}
            disabled={disabled}
            onChange={(event) =>
              onNoteChange(row.original.id, event.target.value)
            }
          />
        )
      },
    }),
  ])
}
