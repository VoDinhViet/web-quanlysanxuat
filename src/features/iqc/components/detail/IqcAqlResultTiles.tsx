import type { ReactNode } from "react"

import { IqcResultBadge } from "@/features/iqc/components/IqcBadges"
import type { IqcResult } from "@/lib/types/iqc.type"

type IqcAqlResultTilesProps = {
  sampleSize: number | null
  defectQty: number | null
  ac: number | null
  re: number | null
  result: IqcResult | null
}

type NumberTile = { label: string; value: ReactNode }

// Small live-updating tile row inside IqcAqlInputCard — same flat-div shell idiom as
// IqcStatCards (no shadcn Card), sized down for a card-internal row. Every value is null until
// inspectionLevel+aqlLevel resolve an AQL plan (or, for sampleSize/defectQty, until the user has
// typed something).
export function IqcAqlResultTiles({
  sampleSize,
  defectQty,
  ac,
  re,
  result,
}: IqcAqlResultTilesProps) {
  const tiles: NumberTile[] = [
    { label: "Cỡ mẫu (n)", value: sampleSize ?? "—" },
    { label: "Số lỗi", value: defectQty ?? "—" },
    { label: "Ac (đạt ≤)", value: ac ?? "—" },
    { label: "Re (không đạt ≥)", value: re ?? "—" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg bg-muted/40 px-3 py-2.5">
          <p className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            {tile.label}
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {tile.value}
          </p>
        </div>
      ))}

      <div className="rounded-lg bg-muted/40 px-3 py-2.5">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Kết quả
        </p>
        <div className="mt-1">
          <IqcResultBadge result={result} />
        </div>
      </div>
    </div>
  )
}
