import { createColumnHelper } from "@tanstack/react-table"
import { Edit3, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getRowErrors } from "@/features/directs/constants/import-direct-rows"
import type { appTableFeatures } from "@/lib/table-features"
import { directImportFields } from "@/lib/types/direct.type"
import type { DirectImportPreviewRow } from "@/lib/types/direct.type"

type ImportColumnHandlers = {
  onEdit: (rowNumber: number) => void
  onDelete: (rowNumber: number) => void
}

const rowColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  DirectImportPreviewRow
>()

function formatMissing(value: string) {
  return value || <span className="text-destructive">Chưa nhập</span>
}

function describeRowErrors(row: DirectImportPreviewRow): string[] {
  const errors = getRowErrors(row)

  return directImportFields.flatMap((field) => {
    const message = errors[field.key]
    return message ? [`${field.label}: ${message}`] : []
  })
}

export function buildImportDirectColumns({
  onEdit,
  onDelete,
}: ImportColumnHandlers) {
  return rowColumnHelper.columns([
    rowColumnHelper.accessor("rowNumber", {
      header: "Dòng",
      meta: {
        headerClassName: "w-16 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    }),
    rowColumnHelper.accessor((row) => row.values.code, {
      id: "code",
      header: "Mã vật tư",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => formatMissing(getValue()),
    }),
    rowColumnHelper.accessor((row) => row.values.name, {
      id: "name",
      header: "Tên vật tư",
      meta: { headerClassName: "min-w-52", cellClassName: "font-normal" },
      cell: ({ getValue }) => (
        <span className="block max-w-72 truncate text-xs font-medium text-foreground">
          {formatMissing(getValue())}
        </span>
      ),
    }),
    rowColumnHelper.accessor((row) => row.values.unitCode, {
      id: "unitCode",
      header: "Đơn vị tính",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue }) => formatMissing(getValue()),
    }),
    rowColumnHelper.display({
      id: "extra",
      header: "Thông tin thêm",
      meta: { headerClassName: "min-w-52" },
      cell: ({ row }) => {
        const { directGrade, dimensions, origin } = row.original.values
        const summary = [directGrade, dimensions, origin]
          .filter(Boolean)
          .join(" · ")

        return (
          <span className="block max-w-64 truncate text-muted-foreground">
            {summary || "—"}
          </span>
        )
      },
    }),
    rowColumnHelper.display({
      id: "status",
      header: "Trạng thái",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        const messages = describeRowErrors(row.original)

        if (messages.length === 0) {
          return (
            <Badge variant="outline" className="bg-success/15 text-success">
              Hợp lệ
            </Badge>
          )
        }

        return (
          <Tooltip>
            <TooltipTrigger
              render={
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive"
                >
                  {messages.length} lỗi
                </Badge>
              }
            />
            <TooltipContent>
              <ul className="flex flex-col gap-0.5">
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )
      },
    }),
    rowColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "font-normal",
      },
      cell: ({ row }) => {
        const { rowNumber } = row.original

        return (
          <div className="flex items-center justify-center gap-1.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Sửa dòng ${rowNumber}`}
                    className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                    onClick={() => onEdit(rowNumber)}
                  >
                    <Edit3 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Xóa dòng ${rowNumber}`}
                    className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    onClick={() => onDelete(rowNumber)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Xóa dòng</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    }),
  ])
}
