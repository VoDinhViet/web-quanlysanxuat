import type { ReactNode } from "react"

type FieldProps = {
  label: string
  value: ReactNode
}

// A fixed-grid meta field — truncates its value, since it sits in a constrained-width grid
// column (detail-page header meta grids). See InfoRow for the non-truncating sidebar variant.
export function MetaField({ label, value }: FieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// A full-width sidebar row — wraps instead of truncating, since its value (a rejection reason,
// a note) can run long. See MetaField for the truncating grid variant.
export function InfoRow({ label, value }: FieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
