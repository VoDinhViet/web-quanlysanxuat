import { useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

// Hai nút cuối form đều đi qua createInventoryReceipt trước (backend luôn tạo DRAFT), rồi tuỳ nút
// bấm gọi tiếp confirm — `shouldConfirmRef` giữ nút vừa bấm. Không bao giờ nhập kho ngay: phiếu dừng
// ở "Chờ IQC" hoặc "Chờ nhập kho", kho bấm "Xác nhận nhập kho" ở trang chi tiết mới cộng tồn.
//   - "Lưu nháp (Draft)"   → create            → DRAFT
//   - "Xác nhận (...)"     → create → confirm  → PENDING_IQC / PENDING_RECEIPT
export function useCreateInventoryReceipt() {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })
  const queryClient = useQueryClient()
  const createReceiptFn = useServerFn(createInventoryReceipt)
  const confirmReceiptFn = useServerFn(confirmInventoryReceipt)

  const shouldConfirmRef = useRef(false)
  // Set ngay sau khi `create` thành công — đọc lại ở `onError` để phân biệt "create thất bại" (báo
  // lỗi bình thường) với "create xong nhưng confirm thất bại" (phiếu đã tồn tại ở trạng thái dở,
  // không thể im lặng như một lỗi thường).
  const createdReceiptIdRef = useRef<string | null>(null)

  const invalidateAndGoToList = async () => {
    await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
    await navigate({
      to: "/manage/inventory-receipts",
      search: { page: 1, limit: 10 },
    })
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async (value: CreateInventoryReceiptSchema) => {
      createdReceiptIdRef.current = null
      const receipt = await createReceiptFn({ data: value })
      createdReceiptIdRef.current = receipt.id

      if (shouldConfirmRef.current) {
        await confirmReceiptFn({ data: { receiptId: receipt.id } })
      }
    },
    onSuccess: async () => {
      toast.success(
        shouldConfirmRef.current
          ? "Đã tạo và xác nhận phiếu nhập kho"
          : "Đã lưu nháp phiếu nhập kho"
      )
      await invalidateAndGoToList()
    },
    onError: async (error) => {
      if (!createdReceiptIdRef.current) {
        toast.error(error.message)
        return
      }

      toast.error(
        `${error.message} Phiếu đã được tạo, vui lòng mở phiếu trong danh sách để hoàn tất.`
      )
      await invalidateAndGoToList()
    },
  })

  return { submit, isPending, shouldConfirmRef }
}
