import { Icon } from "@iconify/react"
import addCircleBold from "@iconify-icons/solar/add-circle-bold"
import penBold from "@iconify-icons/solar/pen-bold"
import trashBinTrashBold from "@iconify-icons/solar/trash-bin-trash-bold"

import { Button } from "@/components/ui/button"
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
import { IconButton } from "@/components/shared/IconButton"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { OperationTypeBadge } from "@/features/products/components/ProductStructureBadges"
import type { ProductOperation } from "@/features/products/types/product-structure.type"

const minutesFormatter = new Intl.NumberFormat("vi-VN")

type ProductOperationsTableProps = {
  operations: ProductOperation[]
  onAdd: () => void
  onEdit: (operation: ProductOperation) => void
  onDelete: (operationId: string) => void
}

// The công đoạn table for one BOM node (assembly or part) — same table framing
// as ProductRevisionsTab, rendered inside the row's operations Sheet
// (ProductStructureTable).
export function ProductOperationsTable({
  operations,
  onAdd,
  onEdit,
  onDelete,
}: ProductOperationsTableProps) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="h-12 hover:bg-muted/45">
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Công đoạn</TableHead>
              <TableHead>Máy · Tổ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">ĐM (phút)</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableEmptyRow colSpan={6} message="Chưa có công đoạn" />
            ) : (
              operations.map((operation) => (
                <TableRow
                  key={operation.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  <TableCell>
                    <span className="mx-auto flex size-6 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-foreground">
                      {operation.sequence}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {operation.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {operation.resource || "—"}
                  </TableCell>
                  <TableCell>
                    <OperationTypeBadge type={operation.type} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {minutesFormatter.format(operation.minutes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <PermissionGate permission="products:update">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Sửa công đoạn"
                              onClick={() => onEdit(operation)}
                            >
                              <Icon icon={penBold} className="size-3.5" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Sửa</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              label="Xoá công đoạn"
                              className="text-destructive"
                              onClick={() => onDelete(operation.id)}
                            >
                              <Icon
                                icon={trashBinTrashBold}
                                className="size-3.5"
                              />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Xoá</TooltipContent>
                        </Tooltip>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PermissionGate permission="products:update">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="gap-1.5 text-xs"
        >
          <Icon icon={addCircleBold} className="size-3.5" />
          Thêm công đoạn
        </Button>
      </PermissionGate>
    </div>
  )
}
