import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"

type ManageTableProps = {
  title: string
  headers: string[]
  children: ReactNode
}

/** Shared shell for the dashboard's small widget tables — a titled card with
 *  a table shell and a bottom-right "Xem tất cả" link; each caller only
 *  supplies its own `<TableRow>`s. */
export function ManageTable({ title, headers, children }: ManageTableProps) {
  return (
    <Card size="sm" className="flex flex-col">
      <CardHeader>
        <ManageCardTitle>{title}</ManageCardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-0">
        <Table className="[&_td]:first:pl-4 [&_td]:last:pr-4 [&_th]:first:pl-4 [&_th]:last:pr-4">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="text-[11px] text-muted-foreground uppercase"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
        <ManageCardLink label="Xem tất cả →" className="mt-auto px-4 pt-3" />
      </CardContent>
    </Card>
  )
}
