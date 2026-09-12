import { useState } from "react"
import { Diskette } from "@solar-icons/react"
import { DateTime } from "luxon"
import { NumericFormat } from "react-number-format"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <Table aria-label="Danh sách phân bổ số lượng">
          <TableHeader className="[&>tr]:h-10 [&>tr]:hover:bg-muted/45">
            <TableRow>
              <TableHead id="prCode" className="w-28">
                Mã PR
              </TableHead>
              <TableHead id="requestedQuantity" className="w-28 text-right">
                SL đề xuất
              </TableHead>
              <TableHead id="quantity" className="w-32 text-right">
                SL báo giá
              </TableHead>
              <TableHead id="reason">Lý do điều chỉnh SL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localAllocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <TableEmpty colSpan={4} title="Chưa có dòng phân bổ nào" />
                </TableCell>
              </TableRow>
            ) : (
              localAllocations.map((allocation, index) => (
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
                    <NumericFormat
                      customInput={Input}
                      className="h-8 w-full bg-background text-xs text-right tabular-nums"
                      value={allocation.quantity ?? ""}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      isAllowed={(values) => {
                        const { floatValue } = values
                        if (floatValue === undefined) return true
                        if (floatValue < 1) return false
                        if (floatValue > allocation.requestedQuantity) return false
                        return true
                      }}
                      placeholder="Nhập SL"
                      onValueChange={(values) =>
                        updateAllocation(index, { quantity: values.floatValue })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      id={`allocation-reason-${allocation.purchaseRequestItemId}`}
                      className="h-8 bg-background text-xs"
                      placeholder="Nếu SL báo giá khác SL đề xuất"
                      value={allocation.quantityAdjustmentReason ?? ""}
                      onChange={(event) =>
                        updateAllocation(index, {
                          quantityAdjustmentReason: event.target.value,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-right text-xs font-medium text-foreground">
        Tổng SL báo giá:{" "}
        <span className="font-semibold text-primary">{total}</span>
      </p>

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
