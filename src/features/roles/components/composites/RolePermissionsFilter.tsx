import {
  CheckCircle,
  CloseCircle,
  Eye,
  Magnifer,
  Restart,
} from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

type RolePermissionsFilterProps = {
  query: string
  onQueryChange: (value: string) => void
  disabled?: boolean
  isFiltered: boolean
  visibleModuleCount: number
  onGrantReadOnly: () => void
  onGrantAll: () => void
  onRevokeAll: () => void
  canRevoke: boolean
}

/** Search plus the 3 bulk-grant presets, scoped to whatever the search currently shows — a
 *  purely presentational filter bar, the scope logic itself lives in `RolePermissions`. */
export function RolePermissionsFilter({
  query,
  onQueryChange,
  disabled,
  isFiltered,
  visibleModuleCount,
  onGrantReadOnly,
  onGrantAll,
  onRevokeAll,
  canRevoke,
}: RolePermissionsFilterProps) {
  const scopeSuffix = isFiltered ? ` (${visibleModuleCount} phân hệ)` : ""

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <InputGroup className="h-9 sm:max-w-xs">
        <InputGroupAddon>
          <Magnifer className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
          placeholder="Tìm phân hệ hoặc quyền..."
          className="text-xs"
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={() => onQueryChange("")}
              aria-label="Xóa tìm kiếm"
            >
              <CloseCircle className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onGrantReadOnly}
          className="gap-1.5 text-xs"
        >
          <Eye className="size-4 text-info" />
          Chỉ xem{scopeSuffix}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={onGrantAll}
          className="gap-1.5 bg-primary/10 text-xs text-primary hover:bg-primary/15"
        >
          <CheckCircle className="size-4" />
          Toàn quyền{scopeSuffix}
        </Button>

        <span aria-hidden className="mx-1 h-4 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canRevoke}
          onClick={onRevokeAll}
          className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Restart className="size-4" />
          Bỏ chọn{scopeSuffix}
        </Button>
      </div>
    </div>
  )
}
