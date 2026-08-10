import { faker } from "@faker-js/faker"
import { DateTime } from "luxon"

import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"
import { resolvePurchaseOrderProgress } from "@/features/purchase-orders/resolve-purchase-order-progress"
import type {
  PurchaseOrderApiRow,
  PurchaseOrderCreatorRef,
  PurchaseOrderRow,
} from "@/lib/types/purchase-order.type"

// Mock data for the PO list UI — no backend `purchase-orders` module exists yet (schema-only, see
// resolve-purchase-order-progress.ts). Seeded so the layout stays stable across reloads; replace
// with real server-function data once the API exists.
faker.seed(2026)

// Fixed pool, not faker.company.name() per row — the NCC filter select needs a stable, small set
// to pick from.
export const MOCK_SUPPLIERS = [
  { id: "sup-1", code: "NCC-001", name: "Hòa Phát" },
  { id: "sup-2", code: "NCC-002", name: "Kim Tín" },
  { id: "sup-3", code: "NCC-003", name: "Jotun VN" },
  { id: "sup-4", code: "NCC-004", name: "Nam Kim" },
  { id: "sup-5", code: "NCC-005", name: "Đại Dũng" },
  { id: "sup-6", code: "NCC-006", name: "Việt Nhật Steel" },
]

const MOCK_CREATORS: PurchaseOrderCreatorRef[] = [
  { id: "user-1", code: "NV-001", fullName: "Nguyễn Văn A" },
  { id: "user-2", code: "NV-002", fullName: "Trần Thị B" },
  { id: "user-3", code: "NV-003", fullName: "Lê Văn C" },
]

function poCode(sequence: number): string {
  return `PO-${sequence.toString().padStart(5, "0")}`
}

function refCode(prefix: string, sequence: number): string {
  return `${prefix}-${sequence.toString().padStart(5, "0")}`
}

// DateTime.now() types as DateTime<true> (always valid), so .toISO() is non-nullable here —
// unlike a generic DateTime parameter's .toISO(), which can return null for an invalid instance.
const TODAY = DateTime.now()

function isoDate(dateTime: DateTime): string {
  return dateTime.toISODate() ?? TODAY.toISODate()
}

// One row per target progress, so every value in PurchaseOrderProgress is guaranteed to appear —
// status + receivedQuantity/orderedQuantity are set so resolvePurchaseOrderProgress actually
// derives the intended progress, rather than the mock asserting it directly.
function buildRow(sequence: number): PurchaseOrderApiRow {
  const supplier =
    MOCK_SUPPLIERS[faker.number.int({ min: 0, max: MOCK_SUPPLIERS.length - 1 })]
  const creator =
    faker.number.int({ min: 0, max: 9 }) === 0
      ? null
      : MOCK_CREATORS[
          faker.number.int({ min: 0, max: MOCK_CREATORS.length - 1 })
        ]

  const orderDate = TODAY.minus({ days: faker.number.int({ min: 1, max: 60 }) })
  const expectedDate =
    faker.number.int({ min: 0, max: 9 }) === 0
      ? null
      : orderDate.plus({ days: faker.number.int({ min: 5, max: 20 }) })

  const sourceCount = faker.number.int({ min: 1, max: 3 })
  const purchaseRequests = Array.from({ length: sourceCount }, () =>
    refCode("PR", faker.number.int({ min: 1, max: 40 }))
  ).map((code, index) => ({ id: `pr-${sequence}-${index}`, code }))

  // ~40% of POs are placed directly, no quotation involved (docs/domains/purchasing.md:
  // "purchase_order_items.quotationItemId tuỳ chọn").
  const hasQuotation = faker.number.int({ min: 0, max: 9 }) >= 4
  const quotations = hasQuotation
    ? [{ id: `rfq-${sequence}`, code: refCode("RFQ", sequence) }]
    : []

  const rotation = sequence % 5
  const status =
    rotation === 4
      ? PurchaseOrderStatus.CANCELLED
      : rotation === 0
        ? PurchaseOrderStatus.DRAFT
        : PurchaseOrderStatus.ORDERED

  const orderedQuantity =
    status === PurchaseOrderStatus.DRAFT
      ? 0
      : faker.number.int({ min: 50, max: 500 })
  const receivedQuantity =
    status !== PurchaseOrderStatus.ORDERED
      ? 0
      : rotation === 1
        ? orderedQuantity // COMPLETED
        : rotation === 2
          ? faker.number.int({ min: 1, max: orderedQuantity - 1 }) // RECEIVING
          : 0 // ORDERED

  const unitPrice = faker.number.int({ min: 15_000, max: 250_000 })

  return {
    id: `po-${sequence}`,
    code: poCode(sequence),
    supplier,
    status,
    orderDate: isoDate(orderDate),
    expectedDate: expectedDate ? isoDate(expectedDate) : null,
    totalAmount: unitPrice * Math.max(orderedQuantity, 1),
    orderedQuantity,
    receivedQuantity,
    purchaseRequests,
    quotations,
    creator,
  }
}

export const MOCK_PURCHASE_ORDER_ROWS: PurchaseOrderRow[] = Array.from(
  { length: 25 },
  (_, index) => {
    const row = buildRow(index + 1)
    return { ...row, progress: resolvePurchaseOrderProgress(row) }
  }
)
