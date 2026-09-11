import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { createColumnHelper, flexRender, useTable } from "@tanstack/react-table"
import { Loader2, PackageSearch } from "lucide-react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updateInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/update-inventory-requisition.api"
import { useHasPermission } from "@/hooks/use-permissions"
import { appTableFeatures } from "@/lib/table-features"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import type {
  InventoryRequisitionDetail,
  InventoryRequisitionItem,
} from "@/lib/types/inventory-requisition.type"

const col = createColumnHelper<
  typeof appTableFeatures,
  InventoryRequisitionItem
>()
const numberFmt = new Intl.NumberFormat("vi-VN")

function buildItemColumns(detail: InventoryRequisitionDetail, editable: boolean) {
  return col.columns([
    col.display({
      id: "stt",
      header: "STT",
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
      cell: ({ row }) => row.index + 1,
    }),

    col.accessor("item.code", {
      header: "Mã VT",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold">{getValue()}</span>
      ),
    }),

    col.accessor("item.name", {
      header: "Tên VT",
      meta: { headerClassName: "min-w-48" },
    }),

    col.accessor("item.unit.name", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),

    col.accessor("bomQuantity", {
      header: "SL BOM",
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return value !== null ? numberFmt.format(value) : "—"
      },
    }),

    col.accessor("issuedQuantity", {
      header: "Đã lãnh",
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return value !== null ? numberFmt.format(value) : "—"
      },
    }),

    col.accessor("onHand", {
      header: "Tồn thực tế",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => numberFmt.format(getValue()),
    }),

    col.accessor("reservedQuantity", {
      header: "Đã giữ",
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => numberFmt.format(getValue()),
    }),

    col.accessor("issuableQuantity", {
      header: "Có thể lãnh",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums font-semibold text-foreground",
      },
      cell: ({ row }) => (
        <IssuableQuantityCell
          item={row.original}
          detail={detail}
          editable={editable}
        />
      ),
    }),

    col.accessor("availableQuantity", {
      header: "Khả dụng",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span className={value < 0 ? "font-medium text-destructive" : ""}>
            {numberFmt.format(value)}
          </span>
        )
      },
    }),

    col.accessor("quantity", {
      header: "SL lãnh",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right tabular-nums font-semibold text-primary",
      },
      cell: ({ row }) => (
        <InventoryRequisitionQuantityCell
          item={row.original}
          detail={detail}
          editable={editable}
        />
      ),
    }),

    col.accessor("note", {
      header: "Ghi chú",
      meta: { headerClassName: "min-w-36" },
      cell: ({ getValue }) => getValue() ?? "—",
    }),
  ])
}

type InventoryRequisitionItemsSectionProps = {
  detail: InventoryRequisitionDetail
}

export function InventoryRequisitionItemsSection({
  detail,
}: InventoryRequisitionItemsSectionProps) {
  const canUpdate = useHasPermission("inventory-requisitions:update")
  const editable =
    canUpdate && detail.status === InventoryRequisitionStatus.DRAFT

  const columns = useMemo(
    () => buildItemColumns(detail, editable),
    [detail, editable]
  )

  const table = useTable({
    data: detail.items,
    columns,
    features: appTableFeatures,
  })

  const totalQuantity = detail.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
          <PackageSearch className="size-3.5 text-muted-foreground" />
          Danh sách vật tư lãnh ({detail.items.length})
        </h3>
        {editable && (
          <span className="text-[11px] text-muted-foreground">
            * Bấm vào ô SL lãnh hoặc bấm số &quot;Có thể lãnh&quot; để điền nhanh
          </span>
        )}
      </div>

      {detail.items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Chưa có vật tư nào"
          description="Phiếu lãnh vật tư này chưa có dòng vật tư nào."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table aria-label="Danh sách vật tư lãnh">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {detail.items.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-wide text-muted-foreground uppercase">
              Tổng SL lãnh:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {numberFmt.format(totalQuantity)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function IssuableQuantityCell({
  item,
  detail,
  editable,
}: {
  item: InventoryRequisitionItem
  detail: InventoryRequisitionDetail
  editable: boolean
}) {
  const queryClient = useQueryClient()
  const updateRequisitionFn = useServerFn(updateInventoryRequisition)
  const issuable = item.issuableQuantity

  const { mutate: quickFill, isPending } = useMutation({
    mutationFn: () => {
      const nextItems = detail.items.map((row) => ({
        itemId: row.item.id,
        quantity: row.id === item.id ? issuable : row.quantity,
        note: row.note,
      }))
      return updateRequisitionFn({
        data: {
          requisitionId: detail.id,
          items: nextItems,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
      toast.success(
        `Đã cập nhật SL lãnh của ${item.item.code}: ${numberFmt.format(issuable)}`
      )
    },
    onError: (error) => toast.error(error.message),
  })

  if (!editable || issuable <= 0 || issuable === item.quantity) {
    return <span>{numberFmt.format(issuable)}</span>
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => quickFill()}
      className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-dotted underline-offset-2 hover:text-primary disabled:opacity-50"
      title="Bấm để điền nhanh toàn bộ số lượng có thể lãnh"
    >
      {numberFmt.format(issuable)}
    </button>
  )
}

function InventoryRequisitionQuantityCell({
  item,
  detail,
  editable,
}: {
  item: InventoryRequisitionItem
  detail: InventoryRequisitionDetail
  editable: boolean
}) {
  const queryClient = useQueryClient()
  const updateRequisitionFn = useServerFn(updateInventoryRequisition)
  const [value, setValue] = useState(item.quantity)

  useEffect(() => {
    setValue(item.quantity)
  }, [item.quantity])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextQuantity: number) => {
      const nextItems = detail.items.map((row) => ({
        itemId: row.item.id,
        quantity: row.id === item.id ? nextQuantity : row.quantity,
        note: row.note,
      }))
      return updateRequisitionFn({
        data: {
          requisitionId: detail.id,
          items: nextItems,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory-requisitions"],
      })
      toast.success(`Đã cập nhật số lượng lãnh của ${item.item.code}`)
    },
    onError: (error) => {
      toast.error(error.message)
      setValue(item.quantity)
    },
  })

  if (!editable) {
    return (
      <span className="tabular-nums font-semibold text-primary">
        {numberFmt.format(item.quantity)}
      </span>
    )
  }

  const handleCommit = () => {
    if (value === item.quantity) return

    if (!(value > 0)) {
      toast.error("Số lượng lãnh phải lớn hơn 0.")
      setValue(item.quantity)
      return
    }

    if (item.issuableQuantity !== null && value > item.issuableQuantity) {
      toast.error(
        `Số lượng lãnh không được vượt quá số lượng có thể lãnh (${numberFmt.format(item.issuableQuantity)}).`
      )
      setValue(item.quantity)
      return
    }

    save(value)
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <NumericFormat
        customInput={Input}
        className="h-8 w-24 text-right text-xs font-semibold tabular-nums text-primary"
        value={value}
        thousandSeparator="."
        decimalSeparator=","
        allowNegative={false}
        disabled={isPending}
        onValueChange={(values) => setValue(values.floatValue ?? 0)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur()
          }
        }}
        onBlur={handleCommit}
        aria-label={`Số lượng lãnh cho ${item.item.name}`}
      />
      {isPending && (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
