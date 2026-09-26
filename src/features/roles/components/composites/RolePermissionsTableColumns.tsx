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
        "sticky left-0 z-30 h-14 bg-card px-4 text-left align-middle text-sm font-semibold text-foreground normal-case",
      cellClassName:
        "sticky left-0 z-1 bg-card px-4 py-3 align-middle whitespace-normal",
    },
    cell: ({ row, table }) => {
      const module = row.original
      const { selected, disabled, onToggleOne } = getTableMeta(table)

      const codes = [
        ...gridActions.flatMap((a) => module.byAction[a.key] ?? []),
        ...module.extras,
      ].map((permission) => permission.code)
      const grantedCount = codes.filter((code) => selected.has(code)).length

      return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {module.label}
            </p>
            {module.description && (
              <p
                title={module.description}
                className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground"
              >
                {module.description}
              </p>
            )}
            {module.extras.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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
          <span
            className={cn(
              "min-w-10 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-medium tabular-nums",
              grantedCount === 0 && "bg-muted text-muted-foreground",
              grantedCount > 0 &&
                grantedCount < codes.length &&
                "bg-primary/10 text-primary",
              grantedCount === codes.length &&
                codes.length > 0 &&
                "bg-success/15 text-success"
            )}
          >
            {grantedCount}/{codes.length}
          </span>
        </div>
      )
    },
  }),

  ...gridActions.map((action) =>
    columnHelper.display({
      id: action.key,
      header: () => (
        <span className="flex items-center justify-center gap-2.5 px-2 text-left">
          <action.icon
            className={cn("size-5 shrink-0", action.iconClassName)}
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-xs font-bold tracking-wide text-foreground uppercase">
              {action.label}
            </span>
            <span className="truncate text-[11px] font-normal text-muted-foreground normal-case">
              {action.hint}
            </span>
          </span>
        </span>
      ),
      meta: {
        headerClassName: cn(
          "h-14 border-b-2 p-0 text-center align-middle",
          action.headerAccentClassName
        ),
        cellClassName: "p-0 text-center align-middle",
      },
      cell: ({ row, table }) => {
        const module = row.original
        const { selected, disabled, onToggleOne } = getTableMeta(table)
        const permission = module.byAction[action.key]

        // Phân hệ không có quyền ở cột này: để trống, không vẽ ô checkbox giả.
        if (!permission) {
          return <div className="h-11" />
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
