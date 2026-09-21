import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createBomOperation } from "@/features/products/api/server-functions/create-bom-operation.api"
import { createRoutingOperation } from "@/features/products/api/server-functions/create-routing-operation.api"
import { deleteBomOperation } from "@/features/products/api/server-functions/delete-bom-operation.api"
import { deleteRoutingOperation } from "@/features/products/api/server-functions/delete-routing-operation.api"
import { updateBomOperation } from "@/features/products/api/server-functions/update-bom-operation.api"
import { updateRoutingOperation } from "@/features/products/api/server-functions/update-routing-operation.api"
import type {
  OperationType,
  ProductOperation,
} from "@/lib/types/operation.type"

// `bomItemId` omit = công đoạn Cấp 0 (route riêng `items/:itemId/operations`, bảng
// `routing_operations` — Cấp 0 không phải một node `bom_items`, không có id nào để truyền cho
// route bom-operations nữa, xem `docs/decisions/level-0-outside-bom-tree-response.md`); có giá
// trị = công đoạn của chính node COMPONENT đó (route `.../bom/items/:bomItemId/operations`).
export type OperationsTarget = {
  productId: string
  bomItemId?: string
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
  const createRoutingFn = useServerFn(createRoutingOperation)

  return useMutation({
    mutationFn: (input: CreateOperationInput) =>
      target.bomItemId
        ? createBomFn({
            data: {
              itemId: target.productId,
              bomItemId: target.bomItemId,
              operationId: input.operationId,
              type: input.type,
              sortOrder: input.sortOrder,
              note: input.note,
            },
          })
        : createRoutingFn({
            data: {
              itemId: target.productId,
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
  const updateRoutingFn = useServerFn(updateRoutingOperation)

  return useMutation({
    mutationFn: (input: {
      stepId: string
      sortOrder?: number
      note?: string
    }) =>
      target.bomItemId
        ? updateBomFn({
            data: {
              itemId: target.productId,
              bomItemId: target.bomItemId,
              stepId: input.stepId,
              sortOrder: input.sortOrder,
              note: input.note,
            },
          })
        : updateRoutingFn({
            data: {
              itemId: target.productId,
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
  const updateRoutingFn = useServerFn(updateRoutingOperation)

  return useMutation({
    mutationFn: (pairs: SortOrderSwapPair[]) =>
      Promise.all(
        pairs.map((pair) =>
          target.bomItemId
            ? updateBomFn({
                data: {
                  itemId: target.productId,
                  bomItemId: target.bomItemId,
                  stepId: pair.stepId,
                  sortOrder: pair.sortOrder,
                },
              })
            : updateRoutingFn({
                data: {
                  itemId: target.productId,
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
  const deleteRoutingFn = useServerFn(deleteRoutingOperation)

  return useMutation({
    mutationFn: (stepId: string) =>
      target.bomItemId
        ? deleteBomFn({
            data: {
              itemId: target.productId,
              bomItemId: target.bomItemId,
              stepId,
            },
          })
        : deleteRoutingFn({
            data: { itemId: target.productId, stepId },
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
