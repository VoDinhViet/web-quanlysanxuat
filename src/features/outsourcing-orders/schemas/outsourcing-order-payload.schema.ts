import { createOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  toIsoDate,
} from "@/lib/zod-transforms"

// Mirrors CreateOutsourcingOrderReqDto — chained onto the form's own schema (not a hand-written
// parallel one) so `data` inside `.handler()` is already wire-ready, same pattern as
// create-purchase-quotation.api.ts. Item's `job`/`bomItem`/`operation`/`unit` are display-nested
// refs the picker copied in as-is from the popup (see CreateOutsourcingOrderPickerSection.tsx) —
// this is the one place they flatten back into OutsourcingOrderItemReqDto's flat wire fields,
// straight passthrough (server does not resolve or re-validate any of it).
export const outsourcingOrderPayloadSchema =
  createOutsourcingOrderSchema.transform(
    ({ items, sendDate, expectedReturnDate, note, ...rest }) => ({
      ...rest,
      sendDate: toIsoDate(sendDate),
      expectedReturnDate: emptyToUndefinedIsoDate(expectedReturnDate),
      note: emptyToUndefined(note),
      items: items.map((item) => ({
        productionJobOperationId: item.productionJobOperationId,
        productionJobBomItemId: item.productionJobBomItemId,
        productionJobId: item.job.id,
        itemId: item.itemId,
        itemCode: item.bomItem.code,
        itemName: item.bomItem.name,
        operationId: item.operation.operationId,
        operationCode: item.operation.code,
        operationName: item.operation.name,
        quantity: item.quantity,
        weight: item.weight,
        area: item.area,
        note: emptyToUndefined(item.note),
      })),
    })
  )
