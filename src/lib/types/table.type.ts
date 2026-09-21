import type { CellData, RowData, TableFeatures } from "@tanstack/react-table"

// TanStack Table's extension point for per-column presentation: each column
// declares its own header/cell classes in `columnDef.meta` instead of a
// parallel switch on column.id. Module augmentation requires an interface.
// v9 adds a leading `TFeatures` generic (and a defaulted `TValue`) to `ColumnMeta` — see
// `@tanstack/table-core`'s `dist/types/ColumnDef.d.ts`.
declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    headerClassName?: string
    cellClassName?: string
  }
}
