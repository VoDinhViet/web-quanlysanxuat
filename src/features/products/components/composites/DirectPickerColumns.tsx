import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"

import { Checkbox } from "@/components/ui/checkbox"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

// Shape an DIRECT `Direct` row satisfies — the only picker for a BOM node's linked item now that
// COMPONENT nodes take a typed code/name instead (docs/decisions/wip-removal.md).
export type DirectPickerRow = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
  client: { name: string } | null
}

const directPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  DirectPickerRow
>()

type BuildDirectPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: DirectPickerRow) => void
  onToggleAll: (checked: boolean) => void
}

// Bước 1 (chọn vật tư) — chỉ còn cột chọn + thông tin item, không còn Số lượng/Ghi chú (nhập ở
// bước 2, CreateDirectDetailsTable.tsx) từ khi dialog "Thêm vật tư" tách thành 2 bước. Own
// useReactTable columns, mirroring the repo's other checkbox-column pickers (e.g.
// PurchaseRequestCreateDirectPickerColumns.tsx) — no shared "select column" helper exists,
// every one of these tables closes over its own checked/disabled state.
export function buildDirectPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildDirectPickerColumnsArgs) {
  return directPickerColumnHelper.columns([
    directPickerColumnHelper.display({
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
          checked={pickedIds.has(row.original.id)}
          disabled={disabled}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.name}`}
        />
      ),
    }),
    directPickerColumnHelper.display({
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
    directPickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    directPickerColumnHelper.accessor((row) => row.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
  ])
}
