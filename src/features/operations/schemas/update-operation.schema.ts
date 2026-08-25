import { z } from "zod"

import { OperationStatus, OperationType } from "@/lib/types/operation.type"
import { emptyToNull } from "@/lib/zod-transforms"

// Wire contract for PATCH /api/operations/:operationId — also the client-side onSubmit validator
// for UpdateOperationForm. `operationId` lives directly in the form's own state, so mutationFn
// receives the form value as-is — no manual id merge at the call site. Deliberately shares no
// field definitions with create-operation.schema.ts: the two flows evolve independently.
export const updateOperationSchema = z.object({
  operationId: z.uuid(),
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
    .transform(emptyToNull),
  status: z.enum(OperationStatus),
})

export type UpdateOperationSchema = z.input<typeof updateOperationSchema>
