import {
  Cell as CellPrimitive,
  Column as ColumnPrimitive,
  Row as RowPrimitive,
  TableBody as TableBodyPrimitive,
  TableFooter as TableFooterPrimitive,
  TableHeader as TableHeaderPrimitive,
  Table as TablePrimitive,
} from "react-aria-components"

import { cn } from "@/lib/utils"
import type * as React from "react"
import type {
  CellProps,
  ColumnProps,
  RowProps,
  TableBodyProps,
  TableFooterProps,
  TableHeaderProps,
  TableProps,
} from "react-aria-components"

function Table({ className, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <TablePrimitive
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader<T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) {
  return (
    <TableHeaderPrimitive
      data-slot="table-header"
      className={cn("bg-muted/45 [&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody<T extends object>({
  className,
  ...props
}: TableBodyProps<T>) {
  return (
    <TableBodyPrimitive
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter<T extends object>({
  className,
  ...props
}: TableFooterProps<T>) {
  return (
    <TableFooterPrimitive
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow<T extends object>({ className, ...props }: RowProps<T>) {
  return (
    <RowPrimitive
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: ColumnProps) {
  return (
    <ColumnPrimitive
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: CellProps) {
  return (
    <CellPrimitive
      data-slot="table-cell"
      className={cn(
        "px-4 py-0 align-middle text-xs font-medium whitespace-nowrap text-foreground [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
