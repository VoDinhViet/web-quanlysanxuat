import { accumulateMockSentQuantity } from "@/features/outsourcing-orders/mock/outsourceable-operations.mock"
import { addMockOutsourcingOrder } from "@/features/outsourcing-orders/mock/outsourcing-orders.mock"
import type { CreateOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

export type CreateMockOutsourcingOrderInput = CreateOutsourcingOrderSchema & {
  supplierName: string
}

export type CreatedMockOutsourcingOrder = {
  id: string
  code: string
}

// Mock stand-in for the eventual `POST /outsourcing-orders` — appends a header row to
// outsourcing-orders.mock.ts's in-memory list (so it shows up back on the list page) and
// accumulates `sentQuantity` on every picked outsourceable-operation row (so reopening the
// wizard reflects the updated "Còn được phép gửi"). `supplierName` comes from the caller because
// the form only carries `supplierId` — resolving the name is the caller's job (it already has
// the full supplier list from its own useQuery), keeping this function a pure mock write instead
// of a second lookup.
//
// Returning `code` here is a mock-only convenience for the success dialog — every real create
// endpoint in this codebase returns `void` or `{id}` only (see create-purchase-request.api.ts,
// create-inventory-receipt.api.ts), never a generated code. When the real endpoint ships, check
// whether it actually echoes `code` back; if not, the success dialog needs a different source for
// it (e.g. a follow-up GET) rather than a one-line options swap.
export function createMockOutsourcingOrder(
  input: CreateMockOutsourcingOrderInput
): Promise<CreatedMockOutsourcingOrder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalQuantity = input.items.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      )
      const operationName = Array.from(
        new Set(input.items.map((item) => item.operationName))
      ).join(" + ")

      const created = addMockOutsourcingOrder({
        supplierName: input.supplierName,
        operationName,
        totalQuantity,
        unit: input.items[0]?.unitName ?? "",
        sentDate: input.sendDate,
        expectedReturnDate: input.expectedReturnDate,
      })

      input.items.forEach((item) =>
        accumulateMockSentQuantity(item.operationId, Number(item.quantity))
      )

      resolve({ id: created.id, code: created.code })
    }, 400)
  })
}
