import { Inbox } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"

type TableEmptyRowProps = {
  colSpan: number
  message?: string
}

/** Shared "no rows" state for every list table — a single full-width row with
 *  a centered icon + message, shown when the table has zero data rows. */
export function TableEmptyRow({
  colSpan,
  message = "Không có dữ liệu",
}: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-40 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Inbox className="size-8 opacity-60" />
          <span className="text-xs font-medium">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  )
}
