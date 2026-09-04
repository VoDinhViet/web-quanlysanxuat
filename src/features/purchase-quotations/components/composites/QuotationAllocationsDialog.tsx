import { useState } from "react"
import { Diskette } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { QuotationItemAllocationValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAllocationsDialogProps = {
  itemName: string
  allocations: QuotationItemAllocationValue[]
  trigger: ReactNode
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
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="shadow-lg ring-0 sm:max-w-2xl">
        <QuotationAllocationsDialogForm
          itemName={itemName}
          allocations={allocations}
          onSave={(next) => {
            onSave(next)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
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
            <TableHead id="prCode" isRowHeader className="w-28">
              Mã PR
            </TableHead>
            <TableHead id="requestedQuantity" className="w-28 text-right">
              SL đề xuất
            </TableHead>
            <TableHead id="quantity" className="w-32 text-right">
              SL báo giá
            </TableHead>
            <TableHead id="reason">Lý do điều chỉnh SL</TableHead>
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <TableEmpty colSpan={4} title="Chưa có dòng phân bổ nào" />
            )}
          >
            {localAllocations.map((allocation, index) => (
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
                  <NumericCellInput
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
