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

  // SL hoàn thành còn lại tối đa được phép báo cáo để đạt đủ chỉ tiêu kế hoạch.
  // SL không đạt (NG) không bị giới hạn bởi kế hoạch (E256), cho phép nhập bù tới khi đạt đủ.
  const remainingPlanned = Math.max(
    0,
    operation.plannedQuantity - operation.completedQuantity
  )

  const form = useAppForm({
    defaultValues: {
      jobOperationId: operation.id,
      completedQuantityDelta: 0,
      rejectedQuantityDelta: 0,
      completedDate: "",
      note: "",
      images: [] as FileFieldValue[],
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createJobOperationReportSchema
        .refine(
          (value) => value.completedQuantityDelta <= remainingPlanned,
          {
            error:
              remainingPlanned === 0
                ? `Công đoạn đã đạt đủ kế hoạch (${operation.plannedQuantity.toLocaleString("vi-VN")} pcs), không thể nhập thêm SL hoàn thành.`
                : `SL hoàn thành lần này không được vượt quá ${remainingPlanned.toLocaleString("vi-VN")} pcs còn lại (kế hoạch: ${operation.plannedQuantity.toLocaleString("vi-VN")} pcs).`,
            path: ["completedQuantityDelta"],
          }
        )
        .refine(
          (value) =>
            value.completedQuantityDelta > 0 || value.rejectedQuantityDelta > 0,
          {
            error: "Vui lòng nhập SL đạt hoặc SL không đạt lớn hơn 0.",
            path: ["completedQuantityDelta"],
          }
        ),
    },
    onSubmit: ({ value }) => {
      mutate(
        { ...value, note: value.note.trim() || undefined },
        { onSuccess: onClose }
      )
    },
  })

  return (
    <>
      <DialogHeader className="gap-0.5">
        <DialogTitle className="text-base">
          {bomItem.name}
        </DialogTitle>
        <DialogDescription className="text-xs">
          <span className="font-mono">{bomItem.code}</span>
          <span className="mx-1.5">·</span>
          Công đoạn: <span className="font-medium text-foreground">{operation.name}</span>
        </DialogDescription>
      </DialogHeader>

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
            <div className="grid grid-cols-2 gap-3">
              <form.AppField name="completedQuantityDelta">
                {(field) => (
                  <field.NumberField
                    label="✓ SL đạt"
                    description={
                      remainingPlanned > 0
                        ? `Còn lại: ${remainingPlanned.toLocaleString("vi-VN")} / ${operation.plannedQuantity.toLocaleString("vi-VN")} pcs`
                        : `Đã đủ kế hoạch: ${operation.plannedQuantity.toLocaleString("vi-VN")} pcs`
                    }
                    placeholder="0"
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="rejectedQuantityDelta">
                {(field) => (
                  <field.NumberField
                    label="✗ SL không đạt"
                    description="Không giới hạn SL"
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
                disabled={isPending}
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu báo cáo"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </PermissionGate>
    </>
  )
}
