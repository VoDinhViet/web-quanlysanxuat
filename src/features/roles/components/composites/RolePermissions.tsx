import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { RotateCw, ShieldAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { permissionCatalogueQueryOptions } from "@/features/roles/api/options"
import { RolePermissionsFilter } from "@/features/roles/components/composites/RolePermissionsFilter"
import { RolePermissionsTable } from "@/features/roles/components/composites/RolePermissionsTable"
import {
  buildPermissionBlocks,
  collectPermissionCodes,
  filterPermissionBlocks,
} from "@/features/roles/constants/permission-blocks"
import type { PermissionCode } from "@/lib/types/permission.type"
import { cn } from "@/lib/utils"

export type RolePermissionsProps = {
  value: PermissionCode[]
  onChange: (value: PermissionCode[]) => void
  disabled?: boolean
  /** When set, the whole matrix renders locked with this reason shown as a banner — for a
   *  role the backend always rejects updates to (e.g. a system role). */
  readOnlyReason?: string
}

/** The role editor's permission matrix: one row per phân hệ (module), grouped into sticky
 *  business-block sections, with 5 CRUD columns plus inline chips for anything else. Owns the
 *  catalogue fetch, the search filter, and the bulk-grant handlers; the table/toolbar
 *  underneath are presentational. */
export function RolePermissions({
  value,
  onChange,
  disabled,
  readOnlyReason,
}: RolePermissionsProps) {
  const {
    data: catalogue,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery(permissionCatalogueQueryOptions())
  const [query, setQuery] = useState("")

  const selected = useMemo(() => new Set(value), [value])
  const blocks = useMemo(
    () => buildPermissionBlocks(catalogue ?? []),
    [catalogue]
  )
  const visibleBlocks = useMemo(
    () => filterPermissionBlocks(blocks, query),
    [blocks, query]
  )
  const visibleModules = useMemo(
    () => visibleBlocks.flatMap((b) => b.modules),
    [visibleBlocks]
  )
  const canRevoke = useMemo(
    () => collectPermissionCodes(visibleModules).some((c) => selected.has(c)),
    [visibleModules, selected]
  )

  const isLocked = disabled || Boolean(readOnlyReason)

  function toggleOne(code: PermissionCode, checked: boolean) {
    onChange(checked ? [...value, code] : value.filter((c) => c !== code))
  }

  function toggleCodes(codes: PermissionCode[], checked: boolean) {
    const targetSet = new Set(codes)
    if (checked) {
      onChange([...value, ...codes.filter((c) => !selected.has(c))])
      return
    }
    onChange(value.filter((c) => !targetSet.has(c)))
  }

  function handleGrantReadOnly() {
    const inScopeCodes = new Set(collectPermissionCodes(visibleModules))
    const readCodes = collectPermissionCodes(visibleModules, "read")
    const kept = value.filter((c) => !inScopeCodes.has(c))
    onChange([...kept, ...readCodes])
  }

  function handleGrantAll() {
    toggleCodes(collectPermissionCodes(visibleModules), true)
  }

  function handleRevokeAll() {
    toggleCodes(collectPermissionCodes(visibleModules), false)
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (isError || catalogue.length === 0) {
    return (
      <Empty className="border border-dashed border-border">
        <EmptyMedia variant="icon">
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Chưa tải được danh mục quyền</EmptyTitle>
        <EmptyDescription>
          Không thể tải danh sách phân hệ và chức năng để phân quyền. Vui lòng
          thử lại.
        </EmptyDescription>
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RotateCw className={cn("size-4", isFetching && "animate-spin")} />
            Tải lại
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Phân quyền chức năng
        </h2>
        <p className="text-sm text-muted-foreground">
          Chọn những việc vai trò này được phép làm trong từng phân hệ.
        </p>
      </div>

      {readOnlyReason && (
        <Alert className="mx-4 my-3 sm:mx-5">
          <ShieldAlert />
          <AlertTitle>Vai trò hệ thống</AlertTitle>
          <AlertDescription>{readOnlyReason}</AlertDescription>
        </Alert>
      )}

      <RolePermissionsFilter
        query={query}
        onQueryChange={setQuery}
        disabled={isLocked}
        isFiltered={query.trim().length > 0}
        visibleModuleCount={visibleModules.length}
        onGrantReadOnly={handleGrantReadOnly}
        onGrantAll={handleGrantAll}
        onRevokeAll={handleRevokeAll}
        canRevoke={canRevoke}
      />

      <RolePermissionsTable
        blocks={visibleBlocks}
        selected={selected}
        disabled={isLocked}
        filterQuery={query}
        onToggleOne={toggleOne}
        onToggleCodes={toggleCodes}
      />
    </div>
  )
}
