import { addDays, parseISO, subDays } from "date-fns"

import { vnZone } from "@/lib/time"
import {
  PurchaseLedgerStatus,
  PurchaseLedgerWarning,
} from "@/lib/types/purchase-ledger.type"
import type { PurchaseLedgerApiRow } from "@/lib/types/purchase-ledger.type"

// The backend deliberately doesn't compute this — every row is already an APPROVED PR line
// (server-side WHERE), so "chưa tạo PO" only needs orderedQuantity/createdAt, and "cần xử lý gấp"
// only needs neededDate/status. NO_PO: no PO yet, more than 1 day since the PR was created.
// URGENT: less than 1 day left (or already past) until neededDate and not yet COMPLETED.
export function resolvePurchaseLedgerWarnings(
  row: PurchaseLedgerApiRow,
  today: Date
): PurchaseLedgerWarning[] {
  const warnings: PurchaseLedgerWarning[] = []
  const isActive = row.status !== PurchaseLedgerStatus.COMPLETED
  const createdAt = parseISO(row.createdAt, { in: vnZone })
  const neededDate = parseISO(row.neededDate, { in: vnZone })

  if (isActive && row.orderedQuantity === 0 && today > addDays(createdAt, 1)) {
    warnings.push(PurchaseLedgerWarning.NO_PO)
  }
  if (isActive && today >= subDays(neededDate, 1)) {
    warnings.push(PurchaseLedgerWarning.URGENT)
  }

  return warnings
}
