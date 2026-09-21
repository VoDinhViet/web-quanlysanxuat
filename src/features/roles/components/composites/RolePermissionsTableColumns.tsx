import {
  createColumnHelper,
  metaHelper,
  tableFeatures,
} from "@tanstack/react-table"
import type { Table } from "@tanstack/react-table"

import { appTableFeatures } from "@/lib/table-features"
import { gridActions } from "@/features/roles/constants/permission-blocks"
import type { PermissionModule } from "@/features/roles/constants/permission-blocks"
import { PermissionGrantCheckbox } from "@/features/roles/components/primitives/PermissionGrantCheckbox"
import { SpecialPermissionChip } from "@/features/roles/components/primitives/SpecialPermissionChip"
import type { PermissionCode } from "@/lib/types/permission.type"
import { cn } from "@/lib/utils"

export type RolePermissionsTableMeta = {
  selected: Set<PermissionCode>
  disabled?: boolean
  onToggleOne: (code: PermissionCode, checked: boolean) => void
}

// Extends the app-wide `appTableFeatures` (src/lib/table-features.ts) with a `tableMeta` slot
// — `tableMeta` is per-table by design (see `metaHelper`'s doc comment), since
// `selected`/`onToggleOne` only make sense for this one table.
export const rolePermissionsTableFeatures = tableFeatures({
  ...appTableFeatures,
  tableMeta: metaHelper<RolePermissionsTableMeta>(),
})

function getTableMeta(
  table: Table<typeof rolePermissionsTableFeatures, PermissionModule>
): RolePermissionsTableMeta {
  const { meta } = table.options
  if (!meta) {
    throw new Error("RolePermissionsTable: table.options.meta is required")
  }
  return meta
}

const columnHelper = createColumnHelper<
  typeof rolePermissionsTableFeatures,
  PermissionModule
>()

export const rolePermissionsColumns = columnHelper.columns([
  columnHelper.display({
    id: "module",
    header: "Phân hệ / Chức năng",
    meta: {
      headerClassName:
        "sticky left-0 z-30 h-11 bg-muted/60 px-4 text-left align-middle text-sm font-semibold text-foreground normal-case",
      cellClassName:
        "sticky left-0 z-1 bg-card px-4 py-2.5 align-middle whitespace-normal",
    },
    cell: ({ row, table }) => {
      const module = row.original
      const { selected, disabled, onToggleOne } = getTableMeta(table)

      return (
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium text-foreground">
              {module.label}
            </p>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {module.resource}
            </span>
          </div>
          {module.description && (
            <p className="mt-0.5 text-xs leading-relaxed font-normal text-muted-foreground">
              {module.description}
            </p>
          )}
          {module.extras.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {module.extras.map((extra) => (
                <SpecialPermissionChip
                  key={extra.code}
                  label={extra.label}
                  description={extra.description}
                  checked={selected.has(extra.code)}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    onToggleOne(extra.code, checked)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )
    },
  }),

  ...gridActions.map((action) =>
    columnHelper.display({
      id: action.key,
      header: () => (
        <span className="text-sm font-bold tracking-wide text-foreground uppercase">
          {action.label}
        </span>
      ),
      meta: {
        headerClassName: cn(
          "h-11 border-b-2 p-0 text-center align-middle",
          action.headerAccentClassName
        ),
        cellClassName: "p-0 text-center align-middle",
      },
      cell: ({ row, table }) => {
        const module = row.original
        const { selected, disabled, onToggleOne } = getTableMeta(table)
        const permission = module.byAction[action.key]

        if (!permission) {
          return (
            <div className="flex h-11 items-center justify-center">
              <span
                aria-hidden
                className="h-4 w-4 rounded-sm bg-muted-foreground/10"
              />
            </div>
          )
        }

        return (
          <div className="flex h-11 items-center justify-center">
            <PermissionGrantCheckbox
              checked={selected.has(permission.code)}
              disabled={disabled}
              onCheckedChange={(next) => onToggleOne(permission.code, next)}
              label={`Quyền ${action.label} của phân hệ ${module.label}`}
            />
          </div>
        )
      },
    })
  ),
])
