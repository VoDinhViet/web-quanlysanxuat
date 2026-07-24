import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createProductOperation } from "@/features/products/server-functions/create-product-operation"
import { deleteProductOperation } from "@/features/products/server-functions/delete-product-operation"
import { updateProductOperation } from "@/features/products/server-functions/update-product-operation"
import type { ProductOperation } from "@/features/products/types/operation.type"

type SortOrderPair = { stepId: string; sortOrder: number }

// One write per hook: each owns its server-fn binding plus the shared
// success plumbing (invalidate `["products"]` → toast), mirroring
// `use-product-bom.ts`.
function useCreateOperation(productId: string) {
  const queryClient = useQueryClient()
  const createFn = useServerFn(createProductOperation)
  return useMutation({
    mutationFn: (input: {
      operationId: string
      sortOrder: number
      note?: string
    }) => createFn({ data: { ...input, productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã thêm công đoạn")
    },
    onError: (error) => toast.error(error.message),
  })
}

// Reordering swaps the sortOrder of two adjacent steps — both PATCH calls run
// together as one mutation so there's a single invalidate/toast per move.
function useMoveOperation(productId: string) {
  const queryClient = useQueryClient()
  const updateFn = useServerFn(updateProductOperation)
  return useMutation({
    mutationFn: (pairs: SortOrderPair[]) =>
      Promise.all(
        pairs.map((pair) =>
          updateFn({
            data: { productId, stepId: pair.stepId, sortOrder: pair.sortOrder },
          })
        )
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => toast.error(error.message),
  })
}

function useDeleteOperation(productId: string) {
  const queryClient = useQueryClient()
  const deleteFn = useServerFn(deleteProductOperation)
  return useMutation({
    mutationFn: (stepId: string) => deleteFn({ data: { productId, stepId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã xoá công đoạn")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductOperationsResult {
  addOperation: (operationId: string, note?: string) => void
  moveOperation: (index: number, direction: "up" | "down") => void
  deleteOperation: (stepId: string) => void
  isSaving: boolean
  isDeleting: boolean
}

/**
 * Owns the routing section's writes: add / reorder / delete a step of the
 * product's operations list. `operations` is the already-fetched, in-run-order
 * list — used to compute the next sortOrder on add and the swap pair on move.
 */
export function useProductOperations(
  productId: string,
  operations: ProductOperation[]
): UseProductOperationsResult {
  const create = useCreateOperation(productId)
  const move = useMoveOperation(productId)
  const remove = useDeleteOperation(productId)

  function addOperation(operationId: string, note?: string) {
    const nextSortOrder =
      operations.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1
    create.mutate({ operationId, sortOrder: nextSortOrder, note })
  }

  function moveOperation(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= operations.length) return

    const current = operations[index]
    const target = operations[targetIndex]
    move.mutate([
      { stepId: current.id, sortOrder: target.sortOrder },
      { stepId: target.id, sortOrder: current.sortOrder },
    ])
  }

  function deleteOperation(stepId: string) {
    remove.mutate(stepId)
  }

  return {
    addOperation,
    moveOperation,
    deleteOperation,
    isSaving: create.isPending || move.isPending,
    isDeleting: remove.isPending,
  }
}
