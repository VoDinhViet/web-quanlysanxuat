import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { Gallery } from "@solar-icons/react"

import { Checkbox } from "@/components/ui/checkbox"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

// Shape a DIRECT `Direct` row satisfies — the picker for items added to a Job.
export type ProductionJobItemPickerRow = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
  client: { name: string } | null
}

const pickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionJobItemPickerRow
>()

type BuildProductionJobItemPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: ProductionJobItemPickerRow) => void
  onToggleAll: (checked: boolean) => void
}

// Step 1 (pick items): checkbox + item info only; the quantity is entered in step 2
// (CreateProductionJobIssuesDetailsTable.tsx).
export function buildProductionJobItemPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildProductionJobItemPickerColumnsArgs) {
  return pickerColumnHelper.columns([
    pickerColumnHelper.display({
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
    pickerColumnHelper.display({
      id: "item",
      header: "Mã / Tên",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => <ItemCell item={row.original} />,
    }),
    pickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    pickerColumnHelper.accessor((row) => row.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
  ])
}

type ItemCellProps = {
  item: ProductionJobItemPickerRow
}

// Thumbnail + code/name, shared by both steps' tables.
export function ItemCell({ item }: ItemCellProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
        {item.image ? (
          <ZoomableImage src={resolveFileUrl(item.image.url)} alt={item.name} />
        ) : (
          <Gallery className="size-3 text-muted-foreground/50" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-foreground">
          {item.code}
        </p>
        <p className="truncate text-xs text-muted-foreground">{item.name}</p>
      </div>
    </div>
  )
}
