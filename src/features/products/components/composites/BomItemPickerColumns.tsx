import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { Circle, CircleCheck } from "lucide-react"

import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

// Common shape a WIP `Item` and an RM `Material` both satisfy — the picker
// only ever renders these fields, so a WIP/RM row can be handled uniformly
// without a union type at every call site.
export type BomItemPickerRow = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
  client: { name: string } | null
}

const bomItemPickerColumnHelper = createColumnHelper<BomItemPickerRow>()

type BuildBomItemPickerColumnsArgs = {
  selectedId: string
}

// Own useReactTable columns, mirroring the repo's other picker tables (e.g.
// PurchaseRequestCreateMaterialPickerColumns.tsx) but single-select: a
// filled/outline circle stands in for a checkbox since only one row can be
// the BOM node's linked item. Row selection itself is wired at the
// <TableRow onClick> level by the caller, same as that reference picker —
// these columns are purely presentational.
export function buildBomItemPickerColumns({
  selectedId,
}: BuildBomItemPickerColumnsArgs) {
  return [
    bomItemPickerColumnHelper.display({
      id: "select",
      header: "",
      meta: { headerClassName: "w-8" },
      cell: ({ row }) =>
        row.original.id === selectedId ? (
          <CircleCheck className="size-4 text-primary" />
        ) : (
          <Circle className="size-4 text-muted-foreground/40" />
        ),
    }),
    bomItemPickerColumnHelper.display({
      id: "item",
      header: "Mã / Tên",
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
    bomItemPickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-20" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
    bomItemPickerColumnHelper.accessor((row) => row.client?.name ?? "—", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
    }),
  ]
}
