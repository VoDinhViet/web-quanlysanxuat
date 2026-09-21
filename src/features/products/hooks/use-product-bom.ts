import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { createBomItem } from "@/features/products/api/server-functions/create-bom-item.api"
import { deleteBomItem } from "@/features/products/api/server-functions/delete-bom-item.api"
import { updateBomItem } from "@/features/products/api/server-functions/update-bom-item.api"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"

export type CreateBomItemInput = CreateBomItemSchema & {
  parentId: string | null
}

export type UpdateBomItemInput = UpdateBomItemSchema & {
  bomItemId: string
}

// Create/update giờ đều mở tại chỗ (form nội tuyến trong ProductBomTable/
// BomItemDetailPage/BomItemConsumablesTable, không còn dialog riêng), nên
// callback đóng UI đi kèm mỗi lượt gọi qua tham số `onSuccess` của
// `createItem`/`updateItem` — không cần callback chung ở đây nữa. Xoá vẫn
// dùng chung một `DeleteBomItemDialog` xác nhận từ nhiều nơi (bảng cây lẫn
// BomItemDetailPage) nên giữ callback chung để đóng nó + gỡ lựa chọn hiện
// tại nếu có.
export type ProductBomCallbacks = {
  onSuccessDelete?: () => void
}

function useCreateItem(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const createFn = useServerFn(createBomItem)

  return useMutation({
    mutationFn: (input: CreateBomItemInput) =>
      createFn({ data: { ...input, rootItemId: productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      onSuccess?.()
      toast.success("Đã thêm hạng mục thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

// Không có endpoint tạo hàng loạt ở backend — mỗi vật tư vẫn là một lượt POST riêng, chỉ gộp lại
// một `useMutation` để chỉ có đúng 1 lượt invalidate + 1 toast cho cả lượt thêm, thay vì N lượt
// (dùng `createItem` N lần sẽ bắn N toast). `Promise.all` không huỷ các request đã bay khi 1
// request lỗi — `onSettled` (không phải `onSuccess`) invalidate cache để phần đã tạo thành công
// trước khi lỗi vẫn hiện đúng trên cây, dù toast báo lỗi cho cả lượt.
function useCreateItems(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const createFn = useServerFn(createBomItem)

  return useMutation({
    mutationFn: (inputs: CreateBomItemInput[]) =>
      Promise.all(
        inputs.map((input) =>
          createFn({ data: { ...input, rootItemId: productId } })
        )
      ),
    onSuccess: (_, inputs) => {
      onSuccess?.()
      toast.success(`Đã thêm ${inputs.length} vật tư thành công`)
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  })
}

function useUpdateItem(productId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const updateFn = useServerFn(updateBomItem)

  return useMutation({
    mutationFn: (input: UpdateBomItemInput) =>
      updateFn({ data: { ...input, itemId: productId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
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
      deleteFn({ data: { itemId: productId, bomItemId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      onSuccess?.()
      toast.success("Đã xoá hạng mục thành công")
    },
    onError: (error) => toast.error(error.message),
  })
}

export interface UseProductBomResult {
  // `onSuccess` là callback riêng cho lượt gọi này (đóng form/dòng mở tại chỗ đang gọi nó) —
  // cộng thêm vào, không thay thế, phần chung của mutation (invalidate cache + toast) vẫn luôn
  // chạy trước.
  createItem: (
    value: CreateBomItemSchema,
    parentId: string | null,
    onSuccess?: () => void
  ) => void
  // Thêm nhiều vật tư (CONSUMABLE) cùng lúc — CreateConsumableDialog. `values` đã kèm `parentId` riêng cho
  // từng phần tử (luôn giống nhau trong thực tế — cùng một bomItem — nhưng để mảng tự khai báo
  // thay vì một `parentId` chung, khỏi phải zip lại ở đây).
  createItems: (values: CreateBomItemInput[], onSuccess?: () => void) => void
  updateItem: (
    value: UpdateBomItemSchema,
    bomItemId: string,
    onSuccess?: () => void
  ) => void
  deleteItem: (bomItemId: string, onSuccess?: () => void) => void
  isSaving: boolean
  isDeleting: boolean
}

/**
 * Manages write operations (create, update, delete) for a product's BOM tree structure.
 * Automatically invalidates `["items"]` query cache after successful writes.
 */
export function useProductBom(
  productId: string,
  callbacks?: ProductBomCallbacks
): UseProductBomResult {
  const createItemOperation = useCreateItem(productId)
  const createItemsOperation = useCreateItems(productId)
  const updateItemOperation = useUpdateItem(productId)
  const deleteItemOperation = useDeleteItem(
    productId,
    callbacks?.onSuccessDelete
  )

  function createItem(
    value: CreateBomItemSchema,
    parentId: string | null,
    onSuccess?: () => void
  ) {
    createItemOperation.mutate({ ...value, parentId }, { onSuccess })
  }

  function createItems(values: CreateBomItemInput[], onSuccess?: () => void) {
    createItemsOperation.mutate(values, { onSuccess })
  }

  function updateItem(
    value: UpdateBomItemSchema,
    bomItemId: string,
    onSuccess?: () => void
  ) {
    updateItemOperation.mutate({ ...value, bomItemId }, { onSuccess })
  }

  function deleteItem(bomItemId: string, onSuccess?: () => void) {
    deleteItemOperation.mutate(bomItemId, { onSuccess })
  }

  return {
    createItem,
    createItems,
    updateItem,
    deleteItem,
    isSaving:
      createItemOperation.isPending ||
      createItemsOperation.isPending ||
      updateItemOperation.isPending,
    isDeleting: deleteItemOperation.isPending,
  }
}
