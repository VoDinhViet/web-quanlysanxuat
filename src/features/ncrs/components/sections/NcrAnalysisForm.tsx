import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { departmentQueryOptions } from "@/features/departments/api"
import { ncrOperationsQueryOptions } from "@/features/ncrs/api/options"
import { updateNcr } from "@/features/ncrs/api/server-functions/update-ncr.api"
import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import {
  getNcrDefaultValues,
  updateNcrSchema,
} from "@/features/ncrs/schemas/update-ncr.schema"
import type { UpdateNcrFormValue } from "@/features/ncrs/schemas/update-ncr.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { NcrOriginType, NcrStatus } from "@/lib/types/ncr.type"
import type { NcrDetail } from "@/lib/types/ncr.type"
import { buildSelectOptions } from "@/lib/utils"

type NcrAnalysisFormProps = {
  ncr: NcrDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Analysis (nguyên nhân, biện pháp), department and the repair / remake split. Editable only
// while the NCR is OPEN / REJECTED; the rest of the NG quantity is "chỉ ghi nhận". `ngQty` is
// editable for manual NCRs only (an OQC-born NCR keeps the screened NG quantity).
export function NcrAnalysisForm({ ncr }: NcrAnalysisFormProps) {
  const queryClient = useQueryClient()
  const updateNcrFn = useServerFn(updateNcr)
  const isEditable =
    ncr.status === NcrStatus.OPEN || ncr.status === NcrStatus.REJECTED

  const { data: departments = [], isPending: isDepartmentsPending } = useQuery(
    departmentQueryOptions()
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: (value: UpdateNcrFormValue) => updateNcrFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ncrs"] })
      toast.success("Đã lưu phân tích NCR")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getNcrDefaultValues(ncr),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: updateNcrSchema },
    onSubmit: ({ value }) => save(value),
  })

  const disabled = !isEditable || isPending

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
    >
      <NcrSectionCard
        title="Phân tích & phương án xử lý"
        description="Nguyên nhân, biện pháp, bộ phận phát sinh và SL sửa chữa / làm mới"
      >
        <div className="space-y-5">
          <form.AppField name="defectDescription">
            {(field) => (
              <field.TextareaField
                label="Mô tả lỗi"
                maxLength={1000}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.AppField name="rootCause">
              {(field) => (
                <field.TextareaField
                  label="Nguyên nhân"
                  maxLength={2000}
                  disabled={disabled}
                />
              )}
            </form.AppField>
            <form.AppField name="correctiveAction">
              {(field) => (
                <field.TextareaField
                  label="Biện pháp khắc phục"
                  maxLength={2000}
                  disabled={disabled}
                />
              )}
            </form.AppField>
            <form.AppField name="preventiveAction">
              {(field) => (
                <field.TextareaField
                  label="Biện pháp phòng ngừa / cải tiến"
                  maxLength={2000}
                  disabled={disabled}
                />
              )}
            </form.AppField>
            <form.AppField name="departmentId">
              {(field) => (
                <field.SelectField
                  label="Bộ phận phát sinh NCR"
                  required
                  placeholder="Chọn bộ phận"
                  options={buildSelectOptions(departments)}
                  isPending={isDepartmentsPending}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <form.AppField name="ngQty">
              {(field) => (
                <field.NumberField
                  label="SL hàng lỗi"
                  disabled={disabled || ncr.originType === NcrOriginType.OQC}
                />
              )}
            </form.AppField>
            <form.AppField name="reworkQty">
              {(field) => (
                <field.NumberField label="SL sửa chữa" disabled={disabled} />
              )}
            </form.AppField>
            <form.AppField name="remakeQty">
              {(field) => (
                <field.NumberField label="SL làm mới" disabled={disabled} />
              )}
            </form.AppField>
          </div>

          <form.Subscribe
            selector={(state) => ({
              ngQty: state.values.ngQty,
              reworkQty: state.values.reworkQty,
              remakeQty: state.values.remakeQty,
            })}
          >
            {({ ngQty, reworkQty, remakeQty }) => (
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Chỉ ghi nhận (không xử lý):{" "}
                <span className="font-medium text-foreground">
                  {quantityFormatter.format(
                    Math.max(0, ngQty - reworkQty - remakeQty)
                  )}
                </span>
              </p>
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.values.reworkQty > 0}>
            {(hasRework) =>
              hasRework && (
                <form.Field name="reworkOperationIds">
                  {(field) => (
                    <ReworkOperationsPicker
                      ncrId={ncr.id}
                      selectedIds={field.state.value}
                      disabled={disabled}
                      onChange={field.handleChange}
                    />
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          {isEditable && (
            <PermissionGate permission="ncr:update">
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang lưu..." : "Lưu phân tích"}
                </Button>
              </div>
            </PermissionGate>
          )}
        </div>
      </NcrSectionCard>
    </form>
  )
}

type ReworkOperationsPickerProps = {
  ncrId: string
  selectedIds: string[]
  disabled: boolean
  onChange: (operationIds: string[]) => void
}

function ReworkOperationsPicker({
  ncrId,
  selectedIds,
  disabled,
  onChange,
}: ReworkOperationsPickerProps) {
  const { data: operations = [], isPending } = useQuery(
    ncrOperationsQueryOptions(ncrId)
  )

  const toggle = (operationId: string, checked: boolean) =>
    onChange(
      checked
        ? [...selectedIds, operationId]
        : selectedIds.filter((selectedId) => selectedId !== operationId)
    )

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">
        Công đoạn cần sửa chữa <span className="text-destructive">*</span>
      </p>
      {isPending ? (
        <p className="text-xs text-muted-foreground">Đang tải công đoạn...</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {operations.map((operation) => (
            <label
              key={operation.operationId}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs"
            >
              <Checkbox
                checked={selectedIds.includes(operation.operationId)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  toggle(operation.operationId, checked)
                }
              />
              <span>
                {operation.code} — {operation.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
