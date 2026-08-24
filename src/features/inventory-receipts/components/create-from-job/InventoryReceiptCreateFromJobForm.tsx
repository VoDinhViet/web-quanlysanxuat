import { useEffect, useRef } from "react"
import { useField } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ComboboxOption } from "@/components/shared/inputs/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { InventoryReceiptCreateFromJobHeaderSection } from "@/features/inventory-receipts/components/create-from-job/InventoryReceiptCreateFromJobHeaderSection"
import { InventoryReceiptGenericItemsSection } from "@/features/inventory-receipts/components/create/InventoryReceiptGenericItemsSection"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import {
  createInventoryReceiptFormDefaultValues,
  createInventoryReceiptSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import { productionJobQueryOptions } from "@/features/production-jobs/api"
import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptCreateFromJobFormProps = {
  // Deep-link tuỳ chọn (nút "Nhập kho thành phẩm" trên header chi tiết Job,
  // ProductionJobDetailHeader.tsx — lối vào duy nhất, chỉ hiện khi Job WAITING_DELIVERY) — chỉ là
  // giá trị khởi tạo cho combobox Job bên dưới, không khoá gì.
  initialProductionJobId: string | undefined
}

// Loại phiếu chỉ có PRODUCTION nên dùng thẳng InventoryReceiptGenericItemsSection — không qua
// dispatcher InventoryReceiptItemsSection (nhánh còn lại của nó là chọn theo PO, không áp dụng ở
// đây). Không useFormDraft như InventoryReceiptCreateForm.tsx/CreateFromPoForm.tsx: luồng này chỉ
// 1 bước (chọn Job → sửa SL nếu cần → lưu), một bản nháp cũ gây phiền hơn là giúp.
export function InventoryReceiptCreateFromJobForm({
  initialProductionJobId,
}: InventoryReceiptCreateFromJobFormProps) {
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-from-job",
  })
  const queryClient = useQueryClient()
  const createInventoryReceiptFn = useServerFn(createInventoryReceipt)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateInventoryReceiptSchema) =>
      createInventoryReceiptFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
      toast.success("Đã tạo phiếu nhập kho")
      await navigate({
        to: "/manage/inventory-receipts",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  // Annotated (not inferred) — spreading a literal-typed `receiptType: "PRODUCTION"` into an
  // object literal would narrow the form's whole data type to that literal instead of the
  // `InventoryReceiptType` union `createInventoryReceiptSchema` validates against.
  const defaultValues: CreateInventoryReceiptSchema = {
    ...createInventoryReceiptFormDefaultValues,
    receiptType: InventoryReceiptType.PRODUCTION,
    productionJobId: initialProductionJobId ?? "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createInventoryReceiptSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  const productionJobId = useField({ form, name: "productionJobId" }).state
    .value

  const jobQuery = useQuery({
    ...productionJobQueryOptions(productionJobId),
    enabled: Boolean(productionJobId),
  })

  // Đã fetch chi tiết Job cho việc tự điền dòng vật tư bên dưới — tiện truyền luôn mã Job xuống
  // đầu mục để combobox hiện đúng nhãn ngay khi đến từ deep-link, thay vì trống cho tới khi người
  // dùng gõ tìm lại.
  const initialProductionJob: ComboboxOption | undefined = jobQuery.data
    ? { value: jobQuery.data.id, label: jobQuery.data.code }
    : undefined

  // Mỗi lần chọn (hoặc đổi) Job thì thay hẳn danh sách vật tư bằng đúng 1 dòng — item của Job (mỗi
  // Job chỉ ứng với đúng 1 FG, docs/domains/production.md), SL = SL kế hoạch của Job. `appliedJobId
  // Ref` chặn áp lại khi component re-render với cùng Job (giữ nguyên chỉnh sửa tay của người
  // dùng trên dòng đó) — chỉ áp lại khi Job thực sự đổi. Dòng này vẫn sửa/xoá được bình thường sau
  // khi điền, không khoá.
  const appliedJobIdRef = useRef<string | null>(null)

  useEffect(() => {
    const job = jobQuery.data
    if (!job || appliedJobIdRef.current === job.id) return
    appliedJobIdRef.current = job.id

    form.setFieldValue("items", [
      {
        itemId: job.item.id,
        itemLabel: `${job.item.code} — ${job.item.name}`,
        itemUnit: "",
        purchaseOrderItemId: "",
        quantity: job.quantity,
        unitPrice: undefined,
        note: "",
      },
    ])
  }, [jobQuery.data, form])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <InventoryReceiptCreateFromJobHeaderSection
          form={form}
          disabled={isPending}
          initialProductionJob={initialProductionJob}
        />

        <div className="border-t border-border">
          <InventoryReceiptGenericItemsSection
            form={form}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          disabled={isPending}
          onClick={() =>
            void navigate({
              to: "/manage/inventory-receipts",
              search: { page: 1, limit: 10 },
            })
          }
        >
          Hủy
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => form.reset()}
          >
            <RotateCcw className="size-4" />
            Đặt lại
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save />
                    Tạo phiếu nhập kho
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
