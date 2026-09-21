import { useState } from "react"
import {
  AddSquare,
  AltArrowDown,
  AltArrowUp,
  Export,
  Home,
  TrashBinTrash,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { ClipboardList } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { useGetOperationOptions } from "@/features/operations/api"
import { useProductOperations } from "@/features/products/hooks/use-product-operations"
import type { OperationsTarget } from "@/features/products/hooks/use-product-operations"
import { OperationType, operationTypeLabels } from "@/lib/types/operation.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import { useHasPermission } from "@/hooks/use-permissions"

type OperationTypeContent = {
  label: string
  icon: ComponentType<IconProps>
}

// Tint recipe mirrors SuppliersTableColumns' status badges: shadcn Badge
// (variant="outline") + a bg-<token>/15 text-<token> tint. `type` is chosen per
// routing step at attach time below, not a master catalog attribute.
const operationTypeStyles: Record<OperationType, string> = {
  [OperationType.INHOUSE]: "bg-primary/15 text-primary",
  [OperationType.OUTSOURCE]:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

// Label and icon aren't badge styling, so they stay a plain map rather than
// being folded into the style map above.
const operationTypeContent: Record<OperationType, OperationTypeContent> = {
  [OperationType.INHOUSE]: {
    label: operationTypeLabels[OperationType.INHOUSE],
    icon: Home,
  },
  [OperationType.OUTSOURCE]: {
    label: operationTypeLabels[OperationType.OUTSOURCE],
    icon: Export,
  },
}

export function OperationTypeBadge({ type }: { type: OperationType }) {
  const { label, icon: IconComponent } = operationTypeContent[type]
  return (
    <Badge variant="outline" className={operationTypeStyles[type]}>
      <IconComponent className="size-3" />
      {label}
    </Badge>
  )
}

// The expanded panel beneath a row: a table of that row's own routing steps
// (STT / Công đoạn / Loại / Ghi chú), styled like the outer BOM table above
// it, plus the add-step form when the viewer can manage it. Owns its own
// writes via `useProductOperations(target, ...)` — safe to call
// unconditionally here because this component only mounts while its row is
// expanded, so the call count for any given table row instance never changes
// across renders.
export function ProductOperationsPanel({
  target,
  productOperations,
  isPending,
}: {
  target: OperationsTarget
  productOperations: ProductOperation[]
  isPending: boolean
}) {
  const canEditBom = useHasPermission("items:bom-manage")
  const { create, move, remove } = useProductOperations(
    target,
    productOperations
  )
  const operationPicker = useGetOperationOptions()
  const [selectedOperationId, setSelectedOperationId] = useState<
    string | undefined
  >(undefined)
  const [selectedType, setSelectedType] = useState<OperationType>(
    OperationType.INHOUSE
  )
  const [note, setNote] = useState("")

  function handleAdd() {
    if (!selectedOperationId) return
    create(selectedOperationId, selectedType, note.trim() || undefined)
    setSelectedOperationId(undefined)
    setNote("")
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="size-5" />
      </div>
    )
  }

  const columnCount = canEditBom ? 5 : 4

  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Danh sách công đoạn">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
          <TableRow>
            <TableHead className="w-14">STT</TableHead>
            <TableHead>CÔNG ĐOẠN</TableHead>
            <TableHead className="w-36">LOẠI</TableHead>
            <TableHead>GHI CHÚ</TableHead>
            <PermissionGate permission="items:bom-manage">
              <TableHead className="w-28 text-right">THAO TÁC</TableHead>
            </PermissionGate>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productOperations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <TableEmpty
                  icon={ClipboardList}
                  colSpan={columnCount}
                  title="Chưa có công đoạn nào"
                />
              </TableCell>
            </TableRow>
          ) : (
            productOperations.map((step, idx) => (
              <TableRow key={step.id} id={step.id} className="h-14">
                <TableCell className="font-mono font-bold text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {step.operation.name}
                </TableCell>
                <TableCell>
                  <OperationTypeBadge type={step.type} />
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">
                  {step.note ?? "—"}
                </TableCell>
                <PermissionGate permission="items:bom-manage">
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Di chuyển lên"
                              disabled={idx === 0}
                              onClick={() => move(idx, "up")}
                              className="border border-border/60 hover:bg-muted"
                            >
                              <AltArrowUp className="size-3.5" />
                            </Button>
                          }
                        />
                        <TooltipContent>Di chuyển lên</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Di chuyển xuống"
                              disabled={idx === productOperations.length - 1}
                              onClick={() => move(idx, "down")}
                              className="border border-border/60 hover:bg-muted"
                            >
                              <AltArrowDown className="size-3.5" />
                            </Button>
                          }
                        />
                        <TooltipContent>Di chuyển xuống</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Xoá công đoạn"
                              onClick={() => remove(step.id)}
                              className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <TrashBinTrash className="size-3.5" />
                            </Button>
                          }
                        />
                        <TooltipContent>Xoá công đoạn</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </PermissionGate>
              </TableRow>
            ))
          )}

          <PermissionGate permission="items:bom-manage">
            <TableRow
              id="add-operation"
              className="h-14 bg-card hover:bg-muted/20"
            >
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell>
                <ComboboxField
                  value={selectedOperationId}
                  onValueChange={setSelectedOperationId}
                  options={operationPicker.options}
                  onSearchChange={operationPicker.onSearchChange}
                  isPending={operationPicker.isFetching}
                  emptyMessage="Không tìm thấy công đoạn"
                  placeholder="Chọn công đoạn..."
                />
              </TableCell>
              <TableCell>
                <Select
                  items={operationTypeLabels}
                  value={selectedType}
                  onValueChange={(key) => key !== null && setSelectedType(key)}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OperationType.INHOUSE}>
                      {operationTypeLabels[OperationType.INHOUSE]}
                    </SelectItem>
                    <SelectItem value={OperationType.OUTSOURCE}>
                      {operationTypeLabels[OperationType.OUTSOURCE]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tuỳ chọn)"
                  className="h-9 text-xs"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  disabled={!selectedOperationId}
                  onClick={handleAdd}
                >
                  <AddSquare className="size-3.5" />
                  Thêm
                </Button>
              </TableCell>
            </TableRow>
          </PermissionGate>
        </TableBody>
      </Table>
    </div>
  )
}
