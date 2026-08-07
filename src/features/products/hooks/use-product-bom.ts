import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createBomItem } from "@/features/products/api/server-functions/create-bom-item.api"
import { deleteBomItem } from "@/features/products/api/server-functions/delete-bom-item.api"
import { updateBomItem } from "@/features/products/api/server-functions/update-bom-item.api"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItemDialogState } from "@/lib/types/bom-item.type"

export type { BomItemDialogState }

export type CreateBomItemInput = CreateBomItemSchema & {
  parentId: string | null
}

export type UpdateBomItemInput = UpdateBomItemSchema & {
  bomItemId: string
}

export type ProductBomCallbacks = {
  onSuccessCreate?: () => void
  onSuccessUpdate?: () => void
  onSuccessDelete?: () => void
}

function useCreateItem(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const createFn = useServerFn(createBomItem)

  return useMutation({
    mutationFn: (input: CreateBomItemInput) =>
      createFn({ data: { ...input, productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess?.()
      toast.success("Đã thêm hạng mục thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useUpdateItem(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const updateFn = useServerFn(updateBomItem)

  return useMutation({
    mutationFn: (input: UpdateBomItemInput) =>
      updateFn({ data: { ...input, productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess?.()
      toast.success("Đã cập nhật hạng mục thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useDeleteItem(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const deleteFn = useServerFn(deleteBomItem)

  return useMutation({
    mutationFn: (bomItemId: string) =>
      deleteFn({ data: { productId, bomItemId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess?.()
      toast.success("Đã xoá hạng mục thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductBomResult {
  createItem: (value: CreateBomItemSchema, parentId: string | null) => void
  updateItem: (value: UpdateBomItemSchema, bomItemId: string) => void
  deleteItem: (bomItemId: string) => void
  isSaving: boolean
  isDeleting: boolean
}

/**
 * Manages write operations (create, update, delete) for a product's BOM tree structure.
 * Automatically invalidates `["products"]` query cache after successful writes.
 */
export function useProductBom(
  productId: string,
  callbacks?: ProductBomCallbacks
): UseProductBomResult {
  const createItemOperation = useCreateItem(
    productId,
    callbacks?.onSuccessCreate
  )
  const updateItemOperation = useUpdateItem(
    productId,
    callbacks?.onSuccessUpdate
  )
  const deleteItemOperation = useDeleteItem(
    productId,
    callbacks?.onSuccessDelete
  )

  function createItem(value: CreateBomItemSchema, parentId: string | null) {
    createItemOperation.mutate({ ...value, parentId })
  }

  function updateItem(value: UpdateBomItemSchema, bomItemId: string) {
    updateItemOperation.mutate({ ...value, bomItemId })
  }

  function deleteItem(bomItemId: string) {
    deleteItemOperation.mutate(bomItemId)
  }

  return {
    createItem,
    updateItem,
    deleteItem,
    isSaving: createItemOperation.isPending || updateItemOperation.isPending,
    isDeleting: deleteItemOperation.isPending,
  }
}
