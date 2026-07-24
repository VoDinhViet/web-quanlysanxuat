import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"
import type { Dispatch, SetStateAction } from "react"

import { createBomItem } from "@/features/products/server-functions/create-bom-item"
import { deleteBomItem } from "@/features/products/server-functions/delete-bom-item"
import { updateBomItem } from "@/features/products/server-functions/update-bom-item"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItem } from "@/features/products/types/bom-item.type"

export type BomItemDialogState =
  | { mode: "closed" }
  | { mode: "create"; parentId: string | null }
  | { mode: "update"; node: BomItem }

// One write per hook: each owns its server-fn binding plus the shared
// success plumbing (invalidate `["products"]` → run the caller's `onSuccess`
// side-effect → toast) and error toast. `onSuccess` closes whichever dialog
// the write belongs to, passed in from `useProductBom`.
function useCreateItem(productId: string, onSuccess: () => void) {
  const queryClient = useQueryClient()
  const createFn = useServerFn(createBomItem)
  return useMutation({
    mutationFn: (input: CreateBomItemSchema & { parentId: string | null }) =>
      createFn({ data: { ...input, productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess()
      toast.success("Đã thêm hạng mục")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useUpdateItem(productId: string, onSuccess: () => void) {
  const queryClient = useQueryClient()
  const updateFn = useServerFn(updateBomItem)
  return useMutation({
    mutationFn: (input: UpdateBomItemSchema & { itemId: string }) =>
      updateFn({ data: { ...input, productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess()
      toast.success("Đã cập nhật hạng mục")
    },
    onError: (error) => toast.error(error.message),
  })
}

function useDeleteItem(productId: string, onSuccess: () => void) {
  const queryClient = useQueryClient()
  const deleteFn = useServerFn(deleteBomItem)
  return useMutation({
    mutationFn: (itemId: string) => deleteFn({ data: { productId, itemId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onSuccess()
      toast.success("Đã xoá hạng mục")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductBomResult {
  dialog: BomItemDialogState
  openCreate: (parentId: string | null) => void
  openUpdate: (node: BomItem) => void
  closeDialog: () => void
  createItem: (value: CreateBomItemSchema, parentId: string | null) => void
  updateItem: (value: UpdateBomItemSchema, itemId: string) => void
  isSaving: boolean
  deletingNode: BomItem | null
  setDeletingNode: Dispatch<SetStateAction<BomItem | null>>
  deleteItem: () => void
  isDeleting: boolean
}

/**
 * Owns the BOM tab's authoring: which create/update dialog is open, the
 * pending delete, and the three real mutations (composed from the per-write
 * hooks above). After every write it invalidates the `["products"]` cache so
 * the tree (and any option list) refetches.
 */
export function useProductBom(productId: string): UseProductBomResult {
  const [dialog, setDialog] = useState<BomItemDialogState>({ mode: "closed" })
  const [deletingNode, setDeletingNode] = useState<BomItem | null>(null)
  const closeDialog = () => setDialog({ mode: "closed" })

  const create = useCreateItem(productId, closeDialog)
  const update = useUpdateItem(productId, closeDialog)
  const remove = useDeleteItem(productId, () => setDeletingNode(null))

  function openCreate(parentId: string | null) {
    setDialog({ mode: "create", parentId })
  }

  function openUpdate(node: BomItem) {
    setDialog({ mode: "update", node })
  }

  function createItem(value: CreateBomItemSchema, parentId: string | null) {
    create.mutate({ ...value, parentId })
  }

  function updateItem(value: UpdateBomItemSchema, itemId: string) {
    update.mutate({ ...value, itemId })
  }

  function deleteItem() {
    if (deletingNode) remove.mutate(deletingNode.id)
  }

  return {
    // Create / update dialog
    dialog,
    openCreate,
    openUpdate,
    closeDialog,
    createItem,
    updateItem,
    isSaving: create.isPending || update.isPending,
    // Delete confirm
    deletingNode,
    setDeletingNode,
    deleteItem,
    isDeleting: remove.isPending,
  }
}
