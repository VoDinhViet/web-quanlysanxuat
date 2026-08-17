import { Children } from "react"
import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"

type ManageTableProps = {
  title: string
  headers: string[]
  children: ReactNode
}

/** Shared shell for the dashboard's small widget tables — a titled card with
 *  a table shell and a bottom-right "Xem tất cả" link; each caller only
 *  supplies its own `<TableRow>`s. `Children.count` reads the row count off
 *  `children` itself (always a `data.map(...)` result) rather than adding a
 *  row-count prop every caller would have to pass in lockstep. */
export function ManageTable({ title, headers, children }: ManageTableProps) {
  const isEmpty = Children.count(children) === 0

  return (
    <Card size="sm" className="flex flex-col">
      <CardHeader>
        <ManageCardTitle>{title}</ManageCardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-0">
        <Table className="[&_td]:border-r-0 [&_td]:py-2 [&_td]:first:pl-4 [&_td]:last:pr-4 [&_th]:border-r-0 [&_th]:first:pl-4 [&_th]:last:pr-4">
          <TableHeader className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="text-[11px] font-normal tracking-normal text-muted-foreground uppercase"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableEmpty colSpan={headers.length} title="Chưa có dữ liệu" />
            ) : (
              children
            )}
          </TableBody>
        </Table>
        <ManageCardLink label="Xem tất cả →" className="mt-auto px-4 pt-3" />
      </CardContent>
    </Card>
  )
}
