import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createBomOperation } from "@/features/products/api/server-functions/create-bom-operation.api"
import { createProductOperation } from "@/features/products/api/server-functions/create-product-operation.api"
import { deleteBomOperation } from "@/features/products/api/server-functions/delete-bom-operation.api"
import { deleteProductOperation } from "@/features/products/api/server-functions/delete-product-operation.api"
import { updateBomOperation } from "@/features/products/api/server-functions/update-bom-operation.api"
import { updateProductOperation } from "@/features/products/api/server-functions/update-product-operation.api"
import type { ProductOperation } from "@/lib/types/operation.type"

export type OperationsTarget = {
  productId: string
  bomItemId?: string
}

export type MoveDirection = "up" | "down"

export type CreateOperationInput = {
  operationId: string
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
  const createProductFn = useServerFn(createProductOperation)
  const createBomFn = useServerFn(createBomOperation)

  return useMutation({
    mutationFn: (input: CreateOperationInput) => {
      if (target.bomItemId) {
        return createBomFn({
          data: {
            productId: target.productId,
            bomItemId: target.bomItemId,
            operationId: input.operationId,
            sortOrder: input.sortOrder,
            note: input.note,
          },
        })
      }

      return createProductFn({
        data: {
          productId: target.productId,
          operationId: input.operationId,
          sortOrder: input.sortOrder,
          note: input.note,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã thêm công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useUpdateOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const updateProductFn = useServerFn(updateProductOperation)
  const updateBomFn = useServerFn(updateBomOperation)

  return useMutation({
    mutationFn: (input: {
      stepId: string
      sortOrder?: number
      note?: string
    }) => {
      if (target.bomItemId) {
        return updateBomFn({
          data: {
            productId: target.productId,
            bomItemId: target.bomItemId,
            stepId: input.stepId,
            sortOrder: input.sortOrder,
            note: input.note,
          },
        })
      }

      return updateProductFn({
        data: {
          productId: target.productId,
          stepId: input.stepId,
          sortOrder: input.sortOrder,
          note: input.note,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã cập nhật công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useMoveOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const updateProductFn = useServerFn(updateProductOperation)
  const updateBomFn = useServerFn(updateBomOperation)

  return useMutation({
    mutationFn: (pairs: SortOrderSwapPair[]) =>
      Promise.all(
        pairs.map((pair) => {
          if (target.bomItemId) {
            return updateBomFn({
              data: {
                productId: target.productId,
                bomItemId: target.bomItemId,
                stepId: pair.stepId,
                sortOrder: pair.sortOrder,
              },
            })
          }

          return updateProductFn({
            data: {
              productId: target.productId,
              stepId: pair.stepId,
              sortOrder: pair.sortOrder,
            },
          })
        })
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => toast.error(error.message),
  })
}

function useDeleteOperation(target: OperationsTarget) {
  const queryClient = useQueryClient()
  const deleteProductFn = useServerFn(deleteProductOperation)
  const deleteBomFn = useServerFn(deleteBomOperation)

  return useMutation({
    mutationFn: (stepId: string) => {
      if (target.bomItemId) {
        return deleteBomFn({
          data: {
            productId: target.productId,
            bomItemId: target.bomItemId,
            stepId,
          },
        })
      }

      return deleteProductFn({
        data: {
          productId: target.productId,
          stepId,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã xoá công đoạn thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductOperationsResult {
  create: (operationId: string, note?: string) => void
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
  operations: ProductOperation[]
): UseProductOperationsResult {
  const createOperation = useCreateOperation(target)
  const updateOperation = useUpdateOperation(target)
  const moveOperation = useMoveOperation(target)
  const deleteOperation = useDeleteOperation(target)

  function create(operationId: string, note?: string) {
    const nextSortOrder =
      operations.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1

    createOperation.mutate({
      operationId,
      sortOrder: nextSortOrder,
      note,
    })
  }

  function update(stepId: string, input: UpdateOperationInput) {
    updateOperation.mutate({ stepId, ...input })
  }

  function move(index: number, direction: MoveDirection) {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= operations.length) return

    const currentStep = operations[index]
    const targetStep = operations[targetIndex]

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
