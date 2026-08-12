import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChecklistMinimalistic } from "@solar-icons/react"
import { DateTime } from "luxon"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { resolveIqc } from "@/features/iqc/api/server-functions/resolve-iqc.api"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { IqcDispositionBadge } from "@/features/iqc/components/IqcBadges"
import {
  buildResolveIqcFormDefaultValues,
  resolveIqcSchema,
} from "@/features/iqc/schemas/resolve-iqc.schema"
import { useAppForm } from "@/hooks/use-app-form"
import {
  iqcDispositionLabels,
  IqcDisposition,
  IqcResult,
  IqcStatus,
} from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { z } from "zod"

const dispositionOptions = buildOptionsFromLabels(iqcDispositionLabels)

type IqcDispositionCardProps = {
  detail: IqcDetail
}

// Only ever relevant for a FAIL row — a PASS row (or one still NOT_INSPECTED) never has a
// disposition, so this renders nothing for those. `status === PENDING` is the one window where
// the user can still choose (see IqcDispositionForm below); once `disposition` is set the row has
// moved on to WAITING_RETURN or COMPLETED (CONCESSION) and this renders read-only.
export function IqcDispositionCard({ detail }: IqcDispositionCardProps) {
  if (detail.result !== IqcResult.FAIL) {
    return null
  }

  if (detail.status !== IqcStatus.PENDING) {
    return (
      <IqcDetailSectionCard icon={ChecklistMinimalistic} title="Xử lý QC FAIL">
        <div className="flex flex-wrap items-center gap-3">
          {detail.disposition && (
            <IqcDispositionBadge disposition={detail.disposition} />
          )}
          {detail.resolvedAt && (
            <p className="text-xs text-muted-foreground">
              Đã xử lý lúc{" "}
              {DateTime.fromISO(detail.resolvedAt).toFormat("dd/MM/yyyy HH:mm")}
              {detail.resolverBy && ` bởi ${detail.resolverBy.fullName}`}
            </p>
          )}
        </div>
      </IqcDetailSectionCard>
    )
  }

  return <IqcDispositionForm detail={detail} />
}

type IqcDispositionFormProps = {
  detail: IqcDetail
}

function IqcDispositionForm({ detail }: IqcDispositionFormProps) {
  const queryClient = useQueryClient()
  const resolveIqcFn = useServerFn(resolveIqc)

  const mutation = useMutation({
    mutationFn: (value: z.input<typeof resolveIqcSchema>) =>
      resolveIqcFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["iqc"] })
    },
  })

  const form = useAppForm({
    defaultValues: buildResolveIqcFormDefaultValues(detail.id),
    validators: {
      onSubmit: resolveIqcSchema,
    },
    onSubmit: ({ value }) =>
      mutation.mutate({
        ...value,
        // `validators.onSubmit` (resolveIqcSchema) has already guaranteed a non-blank
        // disposition by the time this runs — TS just can't narrow it from the form's own
        // (deliberately looser, blank-until-picked) value type.
        disposition: value.disposition as IqcDisposition,
      }),
  })

  return (
    <IqcDetailSectionCard icon={ChecklistMinimalistic} title="Xử lý QC FAIL">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
        className="space-y-4"
      >
        <form.AppField name="disposition">
          {(field) => (
            <field.SelectField
              label="Phương án xử lý"
              required
              placeholder="Chọn phương án xử lý"
              options={dispositionOptions}
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.disposition}>
          {(disposition) => {
            if (!disposition) return null

            const preview =
              disposition === IqcDisposition.CONCESSION
                ? "Hoàn thành ngay — không cần xuất trả hàng."
                : 'Chuyển "Chờ trả NCC" — cần xuất hàng NG ra khỏi kho.'

            return (
              <p className="text-xs text-muted-foreground">
                Kết quả: <span className="text-foreground">{preview}</span>
              </p>
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
                    : "Xác nhận xử lý"}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </PermissionGate>
      </form>
    </IqcDetailSectionCard>
  )
}
