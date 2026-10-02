import { useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { confirmInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/confirm-inventory-receipt.api"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import { postInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/post-inventory-receipt.api"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

export type SubmitInventoryReceiptAction = "draft" | "confirm" | "post"

// 3 hành động cuối form đều đi qua createInventoryReceipt trước (backend luôn tạo DRAFT), rồi tuỳ
// nút bấm gọi tiếp confirm/post — `actionRef` giữ hành động vừa bấm:
//   - "Lưu nháp (Draft)"                              → create                    → DRAFT
//   - "Xác nhận (Chờ IQC)" (radio = Yêu cầu QC)        → create → confirm          → PENDING_IQC
//   - "Xác nhận & Nhập kho (Không qua IQC)"            → create → confirm → post   → POSTED
export function useSubmitInventoryReceipt() {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })
  const queryClient = useQueryClient()
  const createReceiptFn = useServerFn(createInventoryReceipt)
  const confirmReceiptFn = useServerFn(confirmInventoryReceipt)
  const postReceiptFn = useServerFn(postInventoryReceipt)

  const actionRef = useRef<SubmitInventoryReceiptAction>("draft")
  // Set ngay sau khi `create` thành công — đọc lại ở `onError` để phân biệt "create thất bại" (báo
  // lỗi bình thường) với "create xong nhưng confirm/post thất bại" (phiếu đã tồn tại ở trạng thái
  // dở, không thể im lặng như một lỗi thường).
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

      if (actionRef.current === "draft") return

      await confirmReceiptFn({ data: { receiptId: receipt.id } })

      if (actionRef.current === "post") {
        await postReceiptFn({ data: { receiptId: receipt.id } })
      }
    },
    onSuccess: async () => {
      toast.success(
        actionRef.current === "draft"
          ? "Đã lưu nháp phiếu nhập kho"
          : actionRef.current === "post"
            ? "Đã tạo và nhập kho phiếu nhập kho"
            : "Đã tạo phiếu nhập kho và gửi IQC"
      )
      await invalidateAndGoToList()
    },
    onError: async (error) => {
      if (!createdReceiptIdRef.current) {
        toast.error(error.message)
        return
      }

      toast.error(
        `${error.message} Phiếu đã được tạo, vui lòng hoàn tất ở trang chi tiết.`
      )
      await invalidateAndGoToList()
    },
  })

  return { submit, isPending, actionRef }
}
