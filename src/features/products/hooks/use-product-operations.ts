import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createBomOperation } from "@/features/products/api/server-functions/create-bom-operation.api"
import { deleteBomOperation } from "@/features/products/api/server-functions/delete-bom-operation.api"
import { updateBomOperation } from "@/features/products/api/server-functions/update-bom-operation.api"
import type {
  OperationType,
  ProductOperation,
} from "@/lib/types/operation.type"

// `bomItemId` bắt buộc — Cấp 0 (ROOT) giờ cũng là một `bom_items` node thật, nên mọi công đoạn
// (kể cả của chính item gốc) đều ghi qua cùng route bom-operations, chỉ khác `bomItemId` trỏ vào
// đúng node nào (`docs/decisions/root-bom-item.md`, backend).
export type OperationsTarget = {
  productId: string
  bomItemId: string
}

export type MoveDirection = "up" | "down"

export type CreateOperationInput = {
  operationId: string
  type: OperationType
  sortOrder: number
  note?: string
}

export type UpdateOperationInput = {
  note?: string
  sortOrder?: number
}

type SortOrderSwapPair = {
  stepId: string
  sortOrder: number
}

function useCreateOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const createBomFn = useServerFn(createBomOperation)

  return useMutation({
    mutationFn: (input: CreateOperationInput) =>
      createBomFn({
        data: {
          itemId: target.productId,
          bomItemId: target.bomItemId,
          operationId: input.operationId,
          type: input.type,
          sortOrder: input.sortOrder,
          note: input.note,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      toast.success("Đã thêm công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useUpdateOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const updateBomFn = useServerFn(updateBomOperation)

  return useMutation({
    mutationFn: (input: {
      stepId: string
      sortOrder?: number
      note?: string
    }) =>
      updateBomFn({
        data: {
          itemId: target.productId,
          bomItemId: target.bomItemId,
          stepId: input.stepId,
          sortOrder: input.sortOrder,
          note: input.note,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      toast.success("Đã cập nhật công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useMoveOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const updateBomFn = useServerFn(updateBomOperation)

  return useMutation({
    mutationFn: (pairs: SortOrderSwapPair[]) =>
      Promise.all(
        pairs.map((pair) =>
          updateBomFn({
            data: {
              itemId: target.productId,
              bomItemId: target.bomItemId,
              stepId: pair.stepId,
              sortOrder: pair.sortOrder,
            },
          })
        )
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
    },
    onError: (error) => toast.error(error.message),
  })
}

function useDeleteOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const deleteBomFn = useServerFn(deleteBomOperation)

  return useMutation({
    mutationFn: (stepId: string) =>
      deleteBomFn({
        data: {
          itemId: target.productId,
          bomItemId: target.bomItemId,
          stepId,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      toast.success("Đã xoá công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductOperationsResult {
  create: (operationId: string, type: OperationType, note?: string) => void
  update: (stepId: string, input: UpdateOperationInput) => void
  move: (index: number, direction: MoveDirection) => void
  remove: (stepId: string) => void
  isSaving: boolean
  isDeleting: boolean
}

/**
 * Owns writing routing steps (create, update, reorder, delete) for a product or BOM item routing.
 * `target` picks whether to write through product-level or BOM item-level API endpoints.
 */
export function useProductOperations(
  target: OperationsTarget,
  productOperations: ProductOperation[]
): UseProductOperationsResult {
  const createOperation = useCreateOperation(target)
  const updateOperation = useUpdateOperation(target)
  const moveOperation = useMoveOperation(target)
  const deleteOperation = useDeleteOperation(target)

  function create(operationId: string, type: OperationType, note?: string) {
    const nextSortOrder =
      productOperations.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1
      ) + 1

    createOperation.mutate({
      operationId,
      type,
      sortOrder: nextSortOrder,
      note,
    })
  }

  function update(stepId: string, input: UpdateOperationInput) {
    updateOperation.mutate({ stepId, ...input })
  }

  function move(index: number, direction: MoveDirection) {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= productOperations.length) return

    const currentStep = productOperations[index]
    const targetStep = productOperations[targetIndex]

    moveOperation.mutate([
      { stepId: currentStep.id, sortOrder: targetStep.sortOrder },
      { stepId: targetStep.id, sortOrder: currentStep.sortOrder },
    ])
  }

  function remove(stepId: string) {
    deleteOperation.mutate(stepId)
  }

  return {
    create,
    update,
    move,
    remove,
    isSaving:
      createOperation.isPending ||
      updateOperation.isPending ||
      moveOperation.isPending,
    isDeleting: deleteOperation.isPending,
  }
}
