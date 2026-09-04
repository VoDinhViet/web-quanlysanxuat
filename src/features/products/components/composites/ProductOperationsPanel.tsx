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
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
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
  operations,
  isPending,
}: {
  target: OperationsTarget
  operations: ProductOperation[]
  isPending: boolean
}) {
  const canManage = useHasPermission("items:bom-manage")
  const { create, move, remove } = useProductOperations(target, operations)
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

  const columnCount = canManage ? 5 : 4

  return (
    <div className="overflow-x-auto rounded-md border border-border/60 bg-card shadow-2xs">
      <Table aria-label="Danh sách công đoạn">
        <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
          <TableHead id="index" className="w-14 font-bold text-foreground">
            STT
          </TableHead>
          <TableHead
            id="operation"
            isRowHeader
            className="font-bold text-foreground"
          >
            CÔNG ĐOẠN
          </TableHead>
          <TableHead id="type" className="w-36 font-bold text-foreground">
            LOẠI
          </TableHead>
          <TableHead id="note" className="font-bold text-foreground">
            GHI CHÚ
          </TableHead>
          <PermissionGate permission="items:bom-manage">
            <TableHead
              id="actions"
              className="w-28 text-right font-bold text-foreground"
            >
              THAO TÁC
            </TableHead>
          </PermissionGate>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <TableEmpty
              icon={ClipboardList}
              colSpan={columnCount}
              title="Chưa có công đoạn nào"
            />
          )}
        >
          {operations.map((step, idx) => (
            <TableRow
              key={step.id}
              id={step.id}
              className="h-14 bg-card hover:bg-muted/20"
            >
              <TableCell className="font-mono font-bold text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell className="font-semibold text-foreground">
                {step.operation.name}
              </TableCell>
              <TableCell>
                <OperationTypeBadge type={step.operation.type} />
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">
                {step.note ?? "—"}
              </TableCell>
              <PermissionGate permission="items:bom-manage">
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <TooltipTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Di chuyển lên"
                        isDisabled={idx === 0}
                        onPress={() => move(idx, "up")}
                        className="border border-border/60 hover:bg-muted"
                      >
                        <AltArrowUp className="size-3.5" />
                      </Button>
                      <Tooltip>Di chuyển lên</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Di chuyển xuống"
                        isDisabled={idx === operations.length - 1}
                        onPress={() => move(idx, "down")}
                        className="border border-border/60 hover:bg-muted"
                      >
                        <AltArrowDown className="size-3.5" />
                      </Button>
                      <Tooltip>Di chuyển xuống</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Xoá công đoạn"
                        onPress={() => remove(step.id)}
                        className="border border-border/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashBinTrash className="size-3.5" />
                      </Button>
                      <Tooltip>Xoá công đoạn</Tooltip>
                    </TooltipTrigger>
                  </div>
                </TableCell>
              </PermissionGate>
            </TableRow>
          ))}

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
                  selectedKey={selectedType}
                  onSelectionChange={(key) =>
                    setSelectedType(String(key) as OperationType)
                  }
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id={OperationType.INHOUSE}>
                      {operationTypeLabels[OperationType.INHOUSE]}
                    </SelectItem>
                    <SelectItem id={OperationType.OUTSOURCE}>
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
                  isDisabled={!selectedOperationId}
                  onPress={handleAdd}
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
