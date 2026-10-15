import { Link } from "@tanstack/react-router"
import {
  AltArrowLeft,
  Bill,
  Checklist,
  ClipboardText,
  DangerTriangle,
  Layers,
  User,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { OqcDetailActions } from "@/features/oqc/components/layouts/OqcDetailActions"
import { OqcDetailSectionCard } from "@/features/oqc/components/layouts/OqcDetailSectionCard"
import { OqcFinishedGoodStrip } from "@/features/oqc/components/composites/OqcFinishedGoodStrip"
import {
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/primitives/OqcBadges"
import { DateTimePicker } from "@/components/shared/composites/DateTimePicker"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import type { OqcDetailFormApi } from "@/features/oqc/components/sections/OqcDetailForm"
import type { NcrRef } from "@/lib/types/ncr.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcLotSummaryCardProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  disabled?: boolean
  isPending: boolean
}

// §1 LÔ KIỂM TRA — header mang luôn danh tính phiếu (mã + 2 badge) và hành động (quay lại, xoá,
// lưu); thân gồm dải thành phẩm (xem OqcFinishedGoodStrip.tsx) + tham chiếu (PO, Job, Công
// đoạn, người tạo) + Ngày kiểm tra (field user tự chọn, cùng idiom IqcGeneralInfoCard.tsx).
export function OqcLotSummaryCard({
  form,
  oqc,
  disabled,
  isPending,
}: OqcLotSummaryCardProps) {
  return (
    <OqcDetailSectionCard
      icon={Layers}
      title="Lô kiểm tra"
      description="Thành phẩm, nguồn gốc và thời điểm lấy mẫu"
      titleExtra={
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">
            {oqc.code}
          </span>
          <OqcStatusBadge status={oqc.status} />
          <OqcResultBadge result={oqc.result} />
        </span>
      }
      action={
        <div className="flex flex-wrap items-start gap-2">
          <LinkButton
            to="/manage/oqc"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách OQC"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>
          <OqcDetailActions form={form} oqc={oqc} isPending={isPending} />
        </div>
      }
    >
      <div className="space-y-5">
        <div className="border-b border-border pb-5">
          <OqcFinishedGoodStrip oqc={oqc} />
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <InfoTile icon={Bill} label="PO" value={oqc.buyerPoNo ?? "—"} />
          <InfoTile
            icon={ClipboardText}
            label="Job (LSX)"
            value={
              <Link
                to="/manage/production-jobs/$productionJobId"
                params={{ productionJobId: oqc.productionJob.id }}
                search={{ tab: "info" }}
                className="font-mono text-primary hover:underline"
              >
                {oqc.productionJob.code}
              </Link>
            }
          />
          <InfoTile
            icon={Checklist}
            label="Công đoạn"
            value={oqc.operation.name}
          />
          <InfoTile
            icon={User}
            label="Người tạo"
            value={oqc.creatorBy?.fullName ?? "—"}
          />
          {oqc.ncr && (
            <InfoTile
              icon={DangerTriangle}
              label="OQC lại của NCR"
              value={<NcrLink ncr={oqc.ncr} />}
            />
          )}
          {oqc.spawnedNcrs && oqc.spawnedNcrs.length > 0 && (
            <InfoTile
              icon={DangerTriangle}
              label="NCR phát sinh"
              value={
                <span className="flex flex-wrap gap-x-3">
                  {oqc.spawnedNcrs.map((ncr) => (
                    <NcrLink key={ncr.id} ncr={ncr} />
                  ))}
                </span>
              }
            />
          )}
        </dl>

        <div className="border-t border-border pt-5 sm:max-w-xs">
          <form.Field name="inspectionDate">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-xs font-medium text-foreground">
                    Ngày kiểm tra
                  </FieldLabel>
                  <DateTimePicker
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    disabled={disabled}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>
    </OqcDetailSectionCard>
  )
}

function NcrLink({ ncr }: { ncr: NcrRef }) {
  return (
    <Link
      to="/manage/ncrs/$ncrId"
      params={{ ncrId: ncr.id }}
      className="font-mono text-primary hover:underline"
    >
      {ncr.code}
    </Link>
  )
}

type InfoTileProps = {
  icon: ComponentType<IconProps>
  label: string
  value: ReactNode
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd
        className="line-clamp-2 text-sm font-medium text-foreground"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
