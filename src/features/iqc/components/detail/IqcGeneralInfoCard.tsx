import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Buildings2,
  Calendar,
  Document,
  InfoCircle,
  User,
} from "@solar-icons/react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { IqcMaterialStrip } from "@/features/iqc/components/detail/IqcMaterialStrip"
import { IqcPoOrReasonCell } from "@/features/iqc/components/IqcTableCells"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import type { IqcDetail } from "@/lib/types/iqc.type"
import { buildSelectOptions } from "@/lib/utils"

type IqcGeneralInfoCardProps = {
  form: IqcDetailFormApi
  iqc: IqcDetail
  disabled?: boolean
}

// THÔNG TIN CHUNG — dải vật tư (xem IqcMaterialStrip.tsx) + tham chiếu (NCC, PO/lý do, người
// tạo, ngày tạo, gộp từ IqcDetailReferenceCard cũ đã xoá) + Bộ phận QC (field
// duy nhất user sửa được ở card này — reference list đọc trực tiếp ở leaf theo quy ước
// "Reference-option lists" của architecture.md, route loader đã prefetch
// departmentOptionsQueryOptions). Tham chiếu render dạng ô label/icon/value xếp chồng, mỗi ô có
// icon riêng cho dễ quét mắt, thay vì hàng dt/dd dẹt.
export function IqcGeneralInfoCard({
  form,
  iqc,
  disabled,
}: IqcGeneralInfoCardProps) {
  const { data: departments } = useSuspenseQuery(
    departmentOptionsQueryOptions()
  )

  return (
    <IqcDetailSectionCard
      icon={InfoCircle}
      title="Thông tin chung"
      description="Vật tư, nguồn gốc và bộ phận phụ trách kiểm tra"
    >
      <div className="space-y-5">
        <div className="border-b border-border pb-5">
          <IqcMaterialStrip iqc={iqc} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tham chiếu
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <InfoTile
              icon={Buildings2}
              label={iqc.client ? "Khách hàng" : "Nhà cung cấp"}
              value={iqc.supplier?.name ?? iqc.client?.name ?? "—"}
            />
            <InfoTile
              icon={Document}
              label="PO / Lý do"
              value={
                <IqcPoOrReasonCell
                  purchaseOrder={iqc.purchaseOrder}
                  reason={iqc.reason}
                />
              }
            />
            <InfoTile
              icon={User}
              label="Người tạo"
              value={iqc.creatorBy?.fullName ?? "—"}
            />
            <InfoTile
              icon={Calendar}
              label="Ngày tạo"
              value={DateTime.fromISO(iqc.createdAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
          </dl>
        </div>

        <div className="border-t border-border pt-5">
          <div className="sm:max-w-xs">
            <form.AppField name="qcDepartmentId">
              {(field) => (
                <field.SelectField
                  label="Bộ phận QC"
                  placeholder="Chọn bộ phận QC"
                  options={buildSelectOptions(departments)}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    </IqcDetailSectionCard>
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
      <dt className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
