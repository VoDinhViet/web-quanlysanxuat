import { revalidateLogic } from "@tanstack/react-form"
import { TriangleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { JobOperationReportEvidenceField } from "@/components/shared/composites/JobOperationReportEvidenceField"
import { useCreateJobOperationReport } from "@/features/production-jobs/api"
import { createJobOperationReportSchema } from "@/lib/create-job-operation-report.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { JobOperationReportRow } from "@/lib/types/production-job.type"
import type { FileFieldValue } from "@/lib/file-field.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type JobOperationReportFormProps = {
  row: JobOperationReportRow
  // null = có thể báo cáo; ngược lại là lý do bị khoá, hiện thay cho khối input thay vì để người
  // dùng bấm rồi mới báo lỗi từ BE.
  disabledReason: string | null
  onClose: () => void
}

// Nội dung dialog "Nhập báo cáo hoàn thành" — dùng chung bởi 2 màn (qua
// JobOperationReportDialog.tsx bọc ngoài): bảng "DANH SÁCH PART" của "Thực hiện sản xuất"
// (ProductionExecutionPartsTableColumns.tsx) và bảng "Công đoạn sản xuất" của Job detail
// (ProductionJobOperationsTable.tsx). Tên component khớp be-quanlysanxuat's
// `createJobOperationReport` (ProductionExecutionService).
export function JobOperationReportForm({
  row,
  disabledReason,
  onClose,
}: JobOperationReportFormProps) {
  const { bomItem, operation } = row
  const { mutate, isPending } = useCreateJobOperationReport()

  // Phần còn được phép nhập thêm (hoàn thành + không đạt cộng lại) — vượt số này là vượt E252
  // (chặn ở client trước khi gọi API, xem C3 trong kế hoạch).
  const remainingAllowance = Math.max(
    operation.plannedQuantity -
      operation.completedQuantity -
      operation.rejectedQuantity,
    0
  )

  const form = useAppForm({
    defaultValues: {
      // `operation.id` — id của `production_job_operations` (khác `operation.operationId`, tham
      // chiếu công đoạn danh mục). Tên field `jobOperationId` khớp BE's route param.
      jobOperationId: operation.id,
      completedQuantityDelta: 0,
      rejectedQuantityDelta: 0,
      completedDate: "",
      note: "",
      images: [] as FileFieldValue[],
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createJobOperationReportSchema.refine(
        (value) =>
          value.completedQuantityDelta + value.rejectedQuantityDelta <=
          remainingAllowance,
        {
          error: `Tổng SL hoàn thành + SL không đạt lần này không được vượt quá ${remainingAllowance} pcs còn lại.`,
          path: ["completedQuantityDelta"],
        }
      ),
    },
    onSubmit: ({ value }) => {
      mutate(value, { onSuccess: onClose })
    },
  })

  return (
    <>
      <DialogHeader className="gap-1">
        <DialogTitle className="flex flex-wrap items-baseline gap-1.5 text-base">
          Nhập báo cáo hoàn thành
          <span className="font-mono text-sm font-normal text-muted-foreground">
            {bomItem.code}
          </span>
        </DialogTitle>
        <DialogDescription className="text-xs">
          {bomItem.name} · Công đoạn {operation.name}
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-3 divide-x divide-border/60 rounded-lg border border-border/60 bg-muted/20 text-center">
        <div className="flex flex-col gap-0.5 px-2 py-2.5">
          <dt className="text-[10px] text-muted-foreground">Định mức</dt>
          <dd className="text-sm font-semibold text-foreground tabular-nums">
            {quantityFormatter.format(operation.plannedQuantity)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 px-2 py-2.5">
          <dt className="text-[10px] text-muted-foreground">Hoàn thành</dt>
          <dd className="text-sm font-semibold text-primary tabular-nums">
            {quantityFormatter.format(operation.completedQuantity)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 px-2 py-2.5">
          <dt className="text-[10px] text-muted-foreground">Còn lại</dt>
          <dd className="text-sm font-semibold text-foreground tabular-nums">
            {quantityFormatter.format(remainingAllowance)}
          </dd>
        </div>
      </dl>

      <PermissionGate
        permission="production:update"
        fallback={
          <Alert className="border-warning/30 bg-warning/10 py-2.5">
            <TriangleAlert className="text-warning" />
            <AlertDescription className="text-xs text-warning/90">
              Bạn không có quyền nhập báo cáo hoàn thành công đoạn.
            </AlertDescription>
          </Alert>
        }
      >
        {disabledReason !== null ? (
          <Alert className="border-warning/30 bg-warning/10 py-2.5">
            <TriangleAlert className="text-warning" />
            <AlertDescription className="text-xs text-warning/90">
              {disabledReason}
            </AlertDescription>
          </Alert>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (form.state.isSubmitting) return
              void form.handleSubmit()
            }}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="completedQuantityDelta">
                {(field) => (
                  <field.NumberField
                    label="SL hoàn thành lần này"
                    required
                    placeholder="0"
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="rejectedQuantityDelta">
                {(field) => (
                  <field.NumberField
                    label="SL không đạt lần này"
                    placeholder="0"
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="completedDate">
              {(field) => (
                <field.DateField
                  label="Ngày hoàn thành"
                  required
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú"
                  placeholder="Nhập ghi chú (nếu có)"
                  maxLength={500}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="images">
              {(field) => (
                <JobOperationReportEvidenceField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                isDisabled={isPending}
                onPress={onClose}
              >
                Hủy
              </Button>
              <Button type="submit" isDisabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu báo cáo"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </PermissionGate>
    </>
  )
}
