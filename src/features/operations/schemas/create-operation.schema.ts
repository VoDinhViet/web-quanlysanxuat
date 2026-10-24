import { z } from "zod"

import { OperationStatus, OperationType } from "@/lib/types/operation.type"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Wire contract for POST /api/operations — also the client-side onSubmit validator for
// CreateOperationForm. `code` is user-entered (the backend 409s on a duplicate). `type` is only
// the default pre-filled when the operation is attached to a product; each attachment can still
// change it. Deliberately shares no field definitions with update-operation.schema.ts: the two
// flows evolve independently.
export const createOperationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã công đoạn")
    .max(50, "Mã công đoạn tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên công đoạn")
    .max(255, "Tên công đoạn tối đa 255 ký tự"),
  type: z.enum(OperationType),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(OperationStatus),
})

export type CreateOperationSchema = z.input<typeof createOperationSchema>

export const createOperationFormDefaultValues: CreateOperationSchema = {
  code: "",
  name: "",
  type: OperationType.INHOUSE,
  note: "",
  status: OperationStatus.ACTIVE,
}
