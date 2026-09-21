import { useState } from "react"
import { DangerTriangle, Diskette } from "@solar-icons/react"
import { DateTime } from "luxon"
import { NumericFormat } from "react-number-format"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { cn } from "@/lib/utils"
import type { QuotationItemAllocationValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAllocationsDialogProps = {
  itemName: string
  allocations: QuotationItemAllocationValue[]
  trigger: ReactElement
  onSave: (allocations: QuotationItemAllocationValue[]) => void
}

// Replaces the old AdjustmentReasonDialog.tsx (one reason field at vật tư level) now that SL/lý
// do điều chỉnh live per dòng ĐXMH (allocation), not per vật tư — a vật tư merging several dòng
// ĐXMH needs one row per allocation here. Same "Dialog unmounts while closed" seed-fresh idiom as
// that file. A plain <table>, not useReactTable: the row set is fixed for the dialog's lifetime
// (no add/remove here — that only happens back in the picker), so column-def machinery buys
// nothing over mapping directly.
export function QuotationAllocationsDialog({
  itemName,
  allocations,
  trigger,
  onSave,
}: QuotationAllocationsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span
        onClick={() => setOpen(true)}
        className="inline-flex w-full cursor-pointer"
      >
        {trigger}
      </span>
      <DialogContent className="shadow-lg ring-0 sm:max-w-2xl">
        {open && (
          <QuotationAllocationsDialogForm
            itemName={itemName}
            allocations={allocations}
            onSave={(next) => {
              onSave(next)
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type QuotationAllocationsDialogFormProps = {
  itemName: string
  allocations: QuotationItemAllocationValue[]
  onSave: (allocations: QuotationItemAllocationValue[]) => void
  onCancel: () => void
}

function QuotationAllocationsDialogForm({
  itemName,
  allocations,
  onSave,
  onCancel,
}: QuotationAllocationsDialogFormProps) {
  const [localAllocations, setLocalAllocations] = useState(allocations)

  function updateAllocation(
    index: number,
    patch: Partial<QuotationItemAllocationValue>
  ) {
    setLocalAllocations((current) =>
      current.map((allocation, i) =>
        i === index ? { ...allocation, ...patch } : allocation
      )
    )
  }

  const total = localAllocations.reduce(
    (sum, allocation) => sum + (allocation.quantity ?? 0),
    0
  )
  const totalRequested = localAllocations.reduce(
    (sum, allocation) => sum + allocation.requestedQuantity,
    0
  )
  const totalOver = total > totalRequested
  const totalDiff = total - totalRequested

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSave(localAllocations)
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Phân bổ SL — {itemName}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          SL báo giá của vật tư này là tổng SL của các dòng đề xuất bên dưới
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead id="prCode">Mã ĐXMH</TableHead>
              <TableHead id="requestedQuantity" className="w-28 text-right">
                SL đề xuất
              </TableHead>
              <TableHead id="quantity" className="w-36 text-right">
                SL báo giá
              </TableHead>
              <TableHead id="quantityAdjustmentReason" className="w-64">
                Lý do điều chỉnh SL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localAllocations.length === 0 ? (
              <TableEmpty
                colSpan={4}
                title="Không có dòng đề xuất nào để phân bổ"
              />
            ) : (
              localAllocations.map((allocation, index) => {
                const isOver =
                  (allocation.quantity ?? 0) > allocation.requestedQuantity
                const diff =
                  (allocation.quantity ?? 0) - allocation.requestedQuantity
                const needsReason =
                  isOver && !allocation.quantityAdjustmentReason?.trim()

                return (
                  <TableRow
                    key={allocation.purchaseRequestItemId}
                    id={allocation.purchaseRequestItemId}
                    className="h-12"
                  >
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {allocation.prCode}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Cần{" "}
                        {DateTime.fromISO(allocation.neededDate).toFormat(
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {allocation.requestedQuantity}
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center">
                        <NumericFormat
                          customInput={Input}
                          className={cn(
                            "h-8 w-full bg-background text-right text-xs tabular-nums",
                            isOver &&
                              "border-warning/70 pr-7 text-warning focus-visible:ring-warning/30 hover:border-warning"
                          )}
                          value={allocation.quantity ?? ""}
                          thousandSeparator="."
                          decimalSeparator=","
                          allowNegative={false}
                          isAllowed={(values) => {
                            const { floatValue } = values
                            if (floatValue === undefined) return true
                            // Chỉ chặn nhập < 1 — không giới hạn trên so với SL đề xuất
                            return floatValue >= 1
                          }}
                          placeholder="Nhập SL"
                          onValueChange={(values) =>
                            updateAllocation(index, {
                              quantity: values.floatValue,
                            })
                          }
                        />
                        {isOver && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="pointer-events-auto absolute right-2 flex items-center text-warning">
                                  <DangerTriangle className="size-3.5 shrink-0" />
                                </span>
                              }
                            />
                            <TooltipContent>
                              {`SL báo giá lớn hơn SL đề xuất (${allocation.quantity}/${allocation.requestedQuantity}, vượt +${diff})`}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        id={`allocation-reason-${allocation.purchaseRequestItemId}`}
                        className={cn(
                          "h-8 bg-background text-xs",
                          needsReason &&
                            "border-warning/60 placeholder:text-warning/70 focus-visible:ring-warning/30"
                        )}
                        placeholder={
                          isOver
                            ? "Nhập lý do SL vượt đề xuất *"
                            : "Nếu SL báo giá khác SL đề xuất"
                        }
                        value={allocation.quantityAdjustmentReason ?? ""}
                        onChange={(event) =>
                          updateAllocation(index, {
                            quantityAdjustmentReason: event.target.value,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs">
        {totalOver ? (
          <div className="flex items-center gap-1.5 font-medium text-warning">
            <DangerTriangle className="size-4 shrink-0" />
            <span>Tổng SL báo giá vượt SL đề xuất (+{totalDiff})</span>
          </div>
        ) : (
          <div />
        )}
        <p className="text-right text-xs font-medium text-foreground">
          Tổng SL báo giá:{" "}
          <span
            className={cn(
              "font-semibold",
              totalOver ? "text-warning" : "text-primary"
            )}
          >
            {total}
          </span>
        </p>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          <Diskette className="size-4" />
          Lưu
        </Button>
      </DialogFooter>
    </form>
  )
}
