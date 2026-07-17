import type { RowData } from "@tanstack/react-table"

// TanStack Table's extension point for per-column presentation: each column
// declares its own header/cell classes in `columnDef.meta` instead of a
// parallel switch on column.id. Module augmentation requires an interface.
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
    cellClassName?: string
  }
}
