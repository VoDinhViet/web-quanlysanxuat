import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import { Eye } from "lucide-react"
import type { appTableFeatures } from "@/lib/table-features"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { vnZone } from "@/lib/time"
import type { HeldRequisition } from "@/lib/types/held-requisition.type"

export const heldQuantityFormatter = new Intl.NumberFormat("vi-VN")

const heldRequisitionColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  HeldRequisition
>()

function TextOrDash({ value }: { value: string | null }) {
  return value ? (
    <span>{value}</span>
  ) : (
    <span className="text-muted-foreground">-</span>
  )
}

// `firstRowNumber` là STT của dòng đầu trang, để STT nối tiếp qua các trang.
export function buildHeldRequisitionsColumns(firstRowNumber: number) {
  return heldRequisitionColumnHelper.columns([
    heldRequisitionColumnHelper.display({
      id: "index",
      header: "STT",
      cell: ({ row }) => firstRowNumber + row.index,
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
    }),

    heldRequisitionColumnHelper.accessor("code", {
      header: "Phiếu lĩnh",
      meta: { headerClassName: "min-w-32" },
      cell: ({ row }) => (
        <Link
          to="/manage/inventory-requisitions/$requisitionId"
          params={{ requisitionId: row.original.requisitionId }}
          className="font-mono text-xs font-medium text-primary hover:underline"
        >
          {row.original.code}
        </Link>
      ),
    }),

    heldRequisitionColumnHelper.accessor("approvedAt", {
      header: "Ngày duyệt",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => {
        const approvedAt = getValue()

        return approvedAt ? (
          <span className="whitespace-nowrap tabular-nums">
            {format(parseISO(approvedAt, { in: vnZone }), "dd/MM/yyyy HH:mm")}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    }),

    heldRequisitionColumnHelper.accessor("jobCode", {
      header: "Job",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">
          <TextOrDash value={getValue()} />
        </span>
      ),
    }),

    heldRequisitionColumnHelper.accessor("poOrReason", {
      header: "PO / Lý do",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => <TextOrDash value={getValue()} />,
    }),

    heldRequisitionColumnHelper.accessor("departmentName", {
      header: "Bộ phận",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => <TextOrDash value={getValue()} />,
    }),

    heldRequisitionColumnHelper.accessor("creatorName", {
      header: "Người lập",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => <TextOrDash value={getValue()} />,
    }),

    heldRequisitionColumnHelper.accessor("quantity", {
      header: "Số lượng giữ",
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right",
      },
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">
          {heldQuantityFormatter.format(getValue())}
        </span>
      ),
    }),

    heldRequisitionColumnHelper.accessor("note", {
      header: "Ghi chú",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => <TextOrDash value={getValue()} />,
    }),

    heldRequisitionColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "min-w-16 text-center",
        cellClassName: "font-normal",
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <LinkButton
                  to="/manage/inventory-requisitions/$requisitionId"
                  params={{ requisitionId: row.original.requisitionId }}
                  variant="outline"
                  size="icon-sm"
                  aria-label="Xem phiếu lĩnh"
                  className="text-muted-foreground hover:border-border hover:text-primary"
                >
                  <Eye className="size-3.5" />
                </LinkButton>
              }
            />
            <TooltipContent>Xem phiếu lĩnh</TooltipContent>
          </Tooltip>
        </div>
      ),
    }),
  ])
}
