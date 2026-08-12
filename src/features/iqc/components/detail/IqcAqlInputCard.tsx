import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClipboardCheck } from "@solar-icons/react"
import { DateTime } from "luxon"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { resolveAqlPlan } from "@/features/iqc/aql-sampling"
import { confirmIqc } from "@/features/iqc/api/server-functions/confirm-iqc.api"
import { IqcAqlResultTiles } from "@/features/iqc/components/detail/IqcAqlResultTiles"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import {
  buildConfirmIqcFormDefaultValues,
  confirmIqcSchema,
} from "@/features/iqc/schemas/confirm-iqc.schema"
import type { ConfirmIqcFormValue } from "@/features/iqc/schemas/confirm-iqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import {
  AQL_LEVELS,
  iqcInspectionLevelLabels,
  IqcResult,
  IqcStatus,
} from "@/lib/types/iqc.type"
import type { IqcDetail, IqcInspectionLevel } from "@/lib/types/iqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { z } from "zod"

const inspectionLevelOptions = buildOptionsFromLabels(iqcInspectionLevelLabels)
const aqlLevelOptions = AQL_LEVELS.map((level) => ({
  value: String(level),
  label: `${level.toFixed(2)}%`,
}))

// Shared by both branches below — resolves the same AQL plan the result tiles/"gợi ý" hint
// preview, from whatever the user has picked so far (either can still be blank).
function resolvePreviewPlan(
  detail: IqcDetail,
  inspectionLevel: IqcInspectionLevel | "",
  aqlLevel: string
) {
  if (!inspectionLevel || !aqlLevel) return undefined

  return resolveAqlPlan(detail.quantity, inspectionLevel, Number(aqlLevel))
}

type IqcAqlInputCardProps = {
  detail: IqcDetail
}

// Central card of the detail page. NOT_INSPECTED: an inline form with a live client-side
// PASS/FAIL preview and the "Xác nhận QC" submit button right here — not a separate dialog, so
// the user can try a few combinations and see the result change before committing (see the
// plan's "Bố cục UI" section for why a dialog doesn't fit this action). An already-decided row
// renders the exact same shape read-only, from the server-computed values, with no form/mutation
// at all.
export function IqcAqlInputCard({ detail }: IqcAqlInputCardProps) {
  if (detail.status !== IqcStatus.NOT_INSPECTED) {
    return <IqcInspectionInfoReadOnly detail={detail} />
  }

  return <IqcAqlConfirmForm detail={detail} />
}

type IqcInspectionInfoReadOnlyProps = {
  detail: IqcDetail
}

function IqcInspectionInfoReadOnly({ detail }: IqcInspectionInfoReadOnlyProps) {
  return (
    <IqcDetailSectionCard icon={ClipboardCheck} title="Thông tin kiểm tra">
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <ReadOnlyField
          label="Inspection Level"
          value={
            detail.inspectionLevel
              ? iqcInspectionLevelLabels[detail.inspectionLevel]
              : "—"
          }
        />
        <ReadOnlyField
          label="Mức AQL"
          value={detail.aqlLevel ? `${detail.aqlLevel.toFixed(2)}%` : "—"}
        />
        <ReadOnlyField
          label="Tiêu chuẩn kiểm"
          value={detail.inspectionStandard ?? "—"}
        />
        <ReadOnlyField
          label="Người kiểm tra"
          value={detail.inspectorName ?? "—"}
        />
        <ReadOnlyField
          label="Ngày kiểm tra"
          value={DateTime.fromISO(detail.inspectionDate).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
        <ReadOnlyField
          label="Dụng cụ đo"
          value={detail.measuringTools ?? "—"}
        />
      </div>
      <IqcAqlResultTiles
        sampleSize={detail.sampleSize}
        defectQty={detail.defectQty}
        ac={detail.ac}
        re={detail.re}
        result={detail.result}
      />
    </IqcDetailSectionCard>
  )
}

type ReadOnlyFieldProps = { label: string; value: string }

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

type IqcAqlConfirmFormProps = {
  detail: IqcDetail
}

function IqcAqlConfirmForm({ detail }: IqcAqlConfirmFormProps) {
  const queryClient = useQueryClient()
  const confirmIqcFn = useServerFn(confirmIqc)

  const mutation = useMutation({
    mutationFn: (value: z.input<typeof confirmIqcSchema>) =>
      confirmIqcFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["iqc"] })
    },
  })

  const form = useAppForm({
    defaultValues: buildConfirmIqcFormDefaultValues(
      detail.id,
      detail.inspectionDate
    ),
    validators: {
      onSubmit: confirmIqcSchema,
    },
    onSubmit: ({ value }: { value: ConfirmIqcFormValue }) =>
      mutation.mutate({
        ...value,
        // `validators.onSubmit` (confirmIqcSchema) has already guaranteed a non-blank
        // inspectionLevel by the time this runs — TS just can't narrow it from the form's own
        // (deliberately looser, blank-until-picked) value type.
        inspectionLevel: value.inspectionLevel as IqcInspectionLevel,
      }),
  })

  return (
    <IqcDetailSectionCard icon={ClipboardCheck} title="Thông tin kiểm tra">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <form.AppField name="inspectionLevel">
            {(field) => (
              <field.SelectField
                label="Inspection Level"
                required
                placeholder="Chọn mức kiểm tra"
                options={inspectionLevelOptions}
              />
            )}
          </form.AppField>

          <form.AppField name="aqlLevel">
            {(field) => (
              <field.SelectField
                label="Mức AQL"
                required
                placeholder="Chọn mức AQL"
                options={aqlLevelOptions}
              />
            )}
          </form.AppField>

          <form.AppField name="inspectionStandard">
            {(field) => (
              <field.TextField
                label="Tiêu chuẩn kiểm"
                placeholder="VD: VT-0152 Rev.02"
              />
            )}
          </form.AppField>

          <form.AppField name="inspectorName">
            {(field) => (
              <field.TextField
                label="Người kiểm tra"
                placeholder="Tên người kiểm"
              />
            )}
          </form.AppField>

          <form.AppField name="inspectionDate">
            {(field) => (
              <field.TextField label="Ngày kiểm tra" type="datetime-local" />
            )}
          </form.AppField>

          <form.AppField name="measuringTools">
            {(field) => (
              <field.TextField
                label="Dụng cụ đo"
                placeholder="VD: Thước cặp, thước lá"
              />
            )}
          </form.AppField>
        </div>

        <form.Subscribe
          selector={(state) => ({
            inspectionLevel: state.values.inspectionLevel,
            aqlLevel: state.values.aqlLevel,
          })}
        >
          {({ inspectionLevel, aqlLevel }) => {
            const plan = resolvePreviewPlan(detail, inspectionLevel, aqlLevel)

            if (!plan) {
              return (
                <p className="text-xs text-muted-foreground">
                  Chọn Inspection Level và AQL Level để xem gợi ý cỡ mẫu.
                </p>
              )
            }

            return (
              <p className="text-xs text-muted-foreground">
                Gợi ý theo bảng AQL (code {plan.codeLetter}): cỡ mẫu{" "}
                <strong className="text-foreground">
                  n = {plan.sampleSize}
                </strong>
                {`, Ac = ${plan.ac}, Re = ${plan.re}. `}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() =>
                    form.setFieldValue("sampleSize", String(plan.sampleSize))
                  }
                >
                  Dùng gợi ý
                </Button>
              </p>
            )
          }}
        </form.Subscribe>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.AppField name="sampleSize">
            {(field) => (
              <field.NumberField
                label={`Số lượng bốc mẫu (${detail.item.unit.name})`}
                required
                placeholder="VD: 32"
                thousandSeparator={false}
              />
            )}
          </form.AppField>

          <form.AppField name="defectQty">
            {(field) => (
              <field.NumberField
                label={`Số lượng NG (${detail.item.unit.name})`}
                required
                placeholder="VD: 0"
                thousandSeparator={false}
              />
            )}
          </form.AppField>
        </div>

        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const plan = resolvePreviewPlan(
              detail,
              values.inspectionLevel,
              values.aqlLevel
            )
            const sampleSize = values.sampleSize
              ? Number(values.sampleSize)
              : null
            const defectQty = values.defectQty ? Number(values.defectQty) : null
            const previewResult =
              plan && defectQty !== null
                ? defectQty <= plan.ac
                  ? IqcResult.PASS
                  : IqcResult.FAIL
                : null

            return (
              <IqcAqlResultTiles
                sampleSize={sampleSize}
                defectQty={defectQty}
                ac={plan?.ac ?? null}
                re={plan?.re ?? null}
                result={previewResult}
              />
            )
          }}
        </form.Subscribe>

        {mutation.error ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}

        <PermissionGate permission="iqc:update">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending
                    ? "Đang xử lý..."
                    : "Xác nhận QC"}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </PermissionGate>
      </form>
    </IqcDetailSectionCard>
  )
}
