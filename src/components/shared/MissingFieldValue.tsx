type MissingFieldValueProps = {
  label?: string
}

// Inline value for a field whose real endpoint doesn't return this data (as opposed to a field
// that's genuinely empty) — flags it in warning yellow so staff can decide field-by-field whether
// to drop it from the UI or ask backend to add it, rather than either hiding it silently or
// leaving a stale mock value in place. See ProductionJobDetailHeader.tsx for the first use.
export function MissingFieldValue({
  label = "Chưa có API",
}: MissingFieldValueProps) {
  return (
    <span className="text-xs font-medium text-warning italic">{label}</span>
  )
}
