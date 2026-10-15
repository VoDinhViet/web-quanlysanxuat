import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ncrOperationsQueryOptions } from "@/features/ncrs/api/options"
import { cn } from "@/lib/utils"

type NcrReworkOperationsPickerProps = {
  ncrId: string
  selectedIds: string[]
  disabled: boolean
  onChange: (operationIds: string[]) => void
}

// Routing operations a REWORK production order can be restricted to, listed in routing order.
export function NcrReworkOperationsPicker({
  ncrId,
  selectedIds,
  disabled,
  onChange,
}: NcrReworkOperationsPickerProps) {
  const { data: operations = [], isPending } = useQuery(
    ncrOperationsQueryOptions(ncrId)
  )

  const toggle = (operationId: string, checked: boolean) =>
    onChange(
      checked
        ? [...selectedIds, operationId]
        : selectedIds.filter((selectedId) => selectedId !== operationId)
    )

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[0, 1, 2, 3].map((placeholder) => (
          <Skeleton key={placeholder} className="h-14" />
        ))}
      </div>
    )
  }

  if (operations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-foreground/70">
        Sản phẩm chưa có công đoạn nào trong quy trình sản xuất
      </p>
    )
  }

  const allIds = operations.map((operation) => operation.operationId)
  const isAllSelected = allIds.every((operationId) =>
    selectedIds.includes(operationId)
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-foreground/70">
          Đã chọn{" "}
          <span className="font-medium text-foreground">
            {selectedIds.length}/{operations.length}
          </span>{" "}
          công đoạn
          {selectedIds.length === 0 && (
            <span className="text-warning-ink">
              {" "}
              — chọn ít nhất một công đoạn
            </span>
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onChange(isAllSelected ? [] : allIds)}
        >
          {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {operations.map((operation, index) => {
          const isSelected = selectedIds.includes(operation.operationId)

          return (
            <label
              key={operation.operationId}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:bg-muted/40",
                disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              )}
            >
              <Checkbox
                checked={isSelected}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  toggle(operation.operationId, checked)
                }
              />
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground/70">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {operation.name}
                </span>
              </span>
              <Badge variant="neutral" className="shrink-0 font-mono">
                {operation.code}
              </Badge>
            </label>
          )
        })}
      </div>
    </div>
  )
}
