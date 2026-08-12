import { DateTime } from "luxon"

import { IqcStatus } from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

type IqcDetailActionsProps = {
  detail: IqcDetail
}

// Purely a status readout — the actual "Xác nhận QC" button lives inside IqcAqlInputCard, next
// to the fields it submits (see that file's header comment for why). For a NOT_INSPECTED row,
// the status badge next to the code already says "Chưa kiểm" and the card below is the call to
// action, so this renders nothing; for an already-confirmed row that went through this flow
// (confirmedAt set — a legacy row created with `result` set directly at creation never has one),
// it surfaces who/when.
export function IqcDetailActions({ detail }: IqcDetailActionsProps) {
  if (detail.status === IqcStatus.NOT_INSPECTED || !detail.confirmedAt) {
    return null
  }

  return (
    <p className="text-xs text-muted-foreground">
      Đã xác nhận lúc{" "}
      {DateTime.fromISO(detail.confirmedAt).toFormat("dd/MM/yyyy HH:mm")}
      {detail.confirmerBy && ` bởi ${detail.confirmerBy.fullName}`}
    </p>
  )
}
