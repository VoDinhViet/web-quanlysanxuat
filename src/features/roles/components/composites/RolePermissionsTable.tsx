import { Fragment, useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { collectPermissionCodes } from "@/features/roles/constants/permission-blocks"
import type { PermissionBlock } from "@/features/roles/constants/permission-blocks"
import { PermissionGrantCheckbox } from "@/features/roles/components/primitives/PermissionGrantCheckbox"
import {
  rolePermissionsColumns,
  rolePermissionsTableFeatures,
} from "@/features/roles/components/composites/RolePermissionsTableColumns"
import type { PermissionCode } from "@/lib/types/permission.type"

type RolePermissionsTableProps = {
  blocks: PermissionBlock[]
  selected: Set<PermissionCode>
  disabled?: boolean
  filterQuery: string
  onToggleOne: (code: PermissionCode, checked: boolean) => void
  onToggleCodes: (codes: PermissionCode[], checked: boolean) => void
}

/** Renders through `useTable`/`flexRender` like every other list in the app — `data` is the
 *  flat list of visible modules, and `selected`/`disabled`/`onToggleOne` travel via
 *  `table.options.meta` since they change on every grant, not through the column defs
 *  themselves (see `RolePermissionsTableColumns.tsx`). `onToggleCodes` stays a plain prop —
 *  no column cell needs it, only the block-header "select all" built here. Block section
 *  headers aren't part of react-table's row model — it has no built-in group/colSpan row for
 *  this shape — so they're inserted by hand while walking `blocks`, looked up back to their
 *  `flexRender`ed row by resource. */
export function RolePermissionsTable({
  blocks,
  selected,
  disabled,
  filterQuery,
  onToggleOne,
  onToggleCodes,
}: RolePermissionsTableProps) {
  const modules = useMemo(() => blocks.flatMap((b) => b.modules), [blocks])

  const table = useTable({
    data: modules,
    columns: rolePermissionsColumns,
    features: rolePermissionsTableFeatures,
    meta: { selected, disabled, onToggleOne },
  })

  if (blocks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Không tìm thấy phân hệ nào phù hợp với từ khóa &quot;{filterQuery}
        &quot;.
      </div>
    )
  }

  const rowsByResource = new Map(
    table.getRowModel().rows.map((row) => [row.original.resource, row])
  )

  return (
    <Table
      className="w-full table-fixed border-collapse text-left text-sm"
      aria-label="Bảng phân quyền"
    >
      <colgroup>
        <col className="w-[30%] min-w-65" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
      </colgroup>

      <TableHeader className="[&_tr]:hover:bg-transparent">
        <TableRow className="sticky top-0 z-20 divide-x divide-border/60 border-b-2 border-b-primary/15 bg-card">
          {table.getFlatHeaders().map((header) => (
            <TableHead
              key={header.id}
              className={header.column.columnDef.meta?.headerClassName}
            >
              {!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {blocks.map((block) => {
          const blockCodes = collectPermissionCodes(block.modules)
          const blockCheckedCount = blockCodes.filter((c) =>
            selected.has(c)
          ).length
          const blockChecked =
            blockCodes.length > 0 && blockCheckedCount === blockCodes.length
          const blockIndeterminate = blockCheckedCount > 0 && !blockChecked
          const BlockIcon = block.icon

          return (
            <Fragment key={block.key}>
              <TableRow className="sticky top-14 z-10 h-11 border-y border-border/60 bg-muted/50 hover:bg-muted/50">
                <TableCell
                  colSpan={rolePermissionsColumns.length}
                  className="px-4 py-0"
                >
                  <div className="flex items-center gap-2">
                    <PermissionGrantCheckbox
                      checked={blockChecked}
                      indeterminate={blockIndeterminate}
                      disabled={disabled || blockCodes.length === 0}
                      onCheckedChange={(checked) =>
                        onToggleCodes(blockCodes, checked)
                      }
                      label={`Toàn bộ quyền của khối ${block.label}`}
                      className="size-3.5"
                    />
                    <BlockIcon className="size-5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {block.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {block.modules.length} phân hệ
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              {block.modules.map((module) => {
                const row = rowsByResource.get(module.resource)
                if (!row) return null

                return (
                  <TableRow key={row.id} className="bg-card hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.cellClassName}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}
