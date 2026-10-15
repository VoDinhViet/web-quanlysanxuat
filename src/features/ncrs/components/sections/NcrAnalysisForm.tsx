import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  DangerTriangle,
  Layers,
  Magnifer,
  Notes,
  Routing,
} from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { departmentQueryOptions } from "@/features/departments/api"
import { updateNcr } from "@/features/ncrs/api/server-functions/update-ncr.api"
import { NcrReworkOperationsPicker } from "@/features/ncrs/components/composites/NcrReworkOperationsPicker"
import { NcrQuantitySplit } from "@/features/ncrs/components/composites/NcrQuantitySplit"
import { NcrFormSection } from "@/features/ncrs/components/layouts/NcrFormSection"
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
        icon={Notes}
        title="Phân tích & phương án xử lý"
        description="Nguyên nhân, biện pháp, bộ phận phát sinh và phân bổ số lượng xử lý"
      >
        <div className="divide-y divide-border">
          <NcrFormSection
            icon={DangerTriangle}
            tone="destructive"
            title="Thông tin lỗi"
            description="Hiện tượng lỗi và bộ phận phát sinh NCR"
          >
            <div className="space-y-5">
              <form.AppField name="defectDescription">
                {(field) => (
                  <field.TextareaField
                    label="Mô tả lỗi"
                    placeholder="Hiện tượng lỗi quan sát được: vị trí, mức độ, cách phát hiện..."
                    maxLength={1000}
                    disabled={disabled}
                  />
                )}
              </form.AppField>
              <div className="sm:max-w-sm">
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
            </div>
          </NcrFormSection>

          <NcrFormSection
            icon={Magnifer}
            tone="info"
            title="Nguyên nhân & biện pháp"
            description="Phân tích nguyên nhân gốc, khắc phục và phòng ngừa tái diễn"
          >
            <div className="space-y-5">
              <form.AppField name="rootCause">
                {(field) => (
                  <field.TextareaField
                    label="Nguyên nhân"
                    placeholder="Nguyên nhân gốc gây ra lỗi (con người, máy móc, vật tư, phương pháp...)"
                    maxLength={2000}
                    disabled={disabled}
                  />
                )}
              </form.AppField>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <form.AppField name="correctiveAction">
                  {(field) => (
                    <field.TextareaField
                      label="Biện pháp khắc phục"
                      placeholder="Cách xử lý ngay lô hàng lỗi này"
                      maxLength={2000}
                      disabled={disabled}
                    />
                  )}
                </form.AppField>
                <form.AppField name="preventiveAction">
                  {(field) => (
                    <field.TextareaField
                      label="Biện pháp phòng ngừa / cải tiến"
                      placeholder="Việc cần thay đổi để lỗi không tái diễn"
                      maxLength={2000}
                      disabled={disabled}
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </NcrFormSection>

          <NcrFormSection
            icon={Layers}
            tone="warning"
            title="Phân bổ số lượng xử lý"
            description="Chia SL hàng lỗi thành sửa chữa và làm mới; phần còn lại chỉ ghi nhận"
          >
            <NcrQuantitySplit
              form={form}
              disabled={disabled}
              isNgQtyLocked={ncr.originType === NcrOriginType.OQC}
              unitName={ncr.item.unit?.name}
            />
          </NcrFormSection>

          <form.Subscribe selector={(state) => state.values.reworkQty > 0}>
            {(hasRework) => (
              <NcrFormSection
                icon={Routing}
                tone={hasRework ? "primary" : "neutral"}
                title={
                  hasRework
                    ? "Công đoạn cần sửa chữa *"
                    : "Công đoạn cần sửa chữa"
                }
                description="Công đoạn trong quy trình mà lệnh sửa chữa sẽ chạy lại"
              >
                {hasRework ? (
                  <form.Field name="reworkOperationIds">
                    {(field) => (
                      <NcrReworkOperationsPicker
                        ncrId={ncr.id}
                        selectedIds={field.state.value}
                        disabled={disabled}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.Field>
                ) : (
                  <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-foreground/70">
                    Nhập SL sửa chữa lớn hơn 0 để chọn công đoạn cần sửa chữa
                  </p>
                )}
              </NcrFormSection>
            )}
          </form.Subscribe>
        </div>

        {isEditable && (
          <PermissionGate permission="ncr:update">
            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu phân tích"}
              </Button>
            </div>
          </PermissionGate>
        )}
      </NcrSectionCard>
    </form>
  )
}
