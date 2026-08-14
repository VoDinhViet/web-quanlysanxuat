import { useState } from "react"
import { Diskette } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NumericCellInput } from "@/components/shared/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/TableTextCellInput"
import type { QuotationItemAllocationValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAllocationsDialogProps = {
  itemName: string
  allocations: QuotationItemAllocationValue[]
  trigger: ReactNode
  onSave: (allocations: QuotationItemAllocationValue[]) => void
}

// Replaces the old AdjustmentReasonDialog.tsx (one reason field at vật tư level) now that SL/lý
// do điều chỉnh live per dòng ĐXMH (allocation), not per vật tư — a vật tư merging several dòng
// ĐXMH needs one row per allocation here. Same "Radix unmounts while closed" seed-fresh idiom as
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-lg ring-0 sm:max-w-2xl">
        <QuotationAllocationsDialogForm
          itemName={itemName}
          allocations={allocations}
          onSave={(next) => {
            onSave(next)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
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
    (sum, allocation) => sum + (Number(allocation.quantity) || 0),
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
        <Table>
          <TableHeader>
            <TableRow className="h-10 hover:bg-muted/45">
              <TableHead className="w-28">Mã PR</TableHead>
              <TableHead className="w-28 text-right">SL đề xuất</TableHead>
              <TableHead className="w-32 text-right">SL báo giá</TableHead>
              <TableHead>Lý do điều chỉnh SL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localAllocations.map((allocation, index) => (
              <TableRow
                key={allocation.purchaseRequestItemId}
                className="h-12"
              >
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {allocation.prCode}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Cần {DateTime.fromISO(allocation.neededDate).toFormat("dd/MM/yyyy")}
                  </p>
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {allocation.requestedQuantity}
                </TableCell>
                <TableCell>
                  <NumericCellInput
                    id={`allocation-quantity-${allocation.purchaseRequestItemId}`}
                    value={allocation.quantity}
                    min={1}
                    onValueChange={(value) =>
                      updateAllocation(index, { quantity: value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <TableTextCellInput
                    id={`allocation-reason-${allocation.purchaseRequestItemId}`}
                    value={allocation.quantityAdjustmentReason}
                    placeholder="Nếu SL báo giá khác SL đề xuất"
                    onValueChange={(value) =>
                      updateAllocation(index, {
                        quantityAdjustmentReason: value,
                      })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-right text-xs font-medium text-foreground">
        Tổng SL báo giá: {total}
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
