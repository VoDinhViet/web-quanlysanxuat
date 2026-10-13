import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { ncrOriginTypeLabels } from "@/lib/types/ncr.type"
import type { NcrDetail } from "@/lib/types/ncr.type"

type NcrInfoCardProps = {
  ncr: NcrDetail
}

type InfoItemProps = {
  label: string
  children: ReactNode
}

function InfoItem({ label, children }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function formatDateTime(isoDate: string | null): string {
  return isoDate ? DateTime.fromISO(isoDate).toFormat("dd/MM/yyyy HH:mm") : "—"
}

export function NcrInfoCard({ ncr }: NcrInfoCardProps) {
  return (
    <NcrSectionCard title="Thông tin chung">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoItem label="Sản phẩm">
          {ncr.item.code} — {ncr.item.name}
        </InfoItem>
        <InfoItem label="Bộ phận phát sinh">
          {ncr.department?.name ?? "—"}
        </InfoItem>
        <InfoItem label="Nguồn">{ncrOriginTypeLabels[ncr.originType]}</InfoItem>
        <InfoItem label="Khách hàng">{ncr.client?.name ?? "—"}</InfoItem>
        <InfoItem label="Đơn hàng (SO)">{ncr.order?.code ?? "—"}</InfoItem>
        <InfoItem label="Job gốc">
          {ncr.productionJob ? (
            <Link
              to="/manage/production-jobs/$productionJobId"
              params={{ productionJobId: ncr.productionJob.id }}
              search={{ tab: "info" }}
              className="font-mono text-primary hover:underline"
            >
              {ncr.productionJob.code}
            </Link>
          ) : (
            "—"
          )}
        </InfoItem>
        <InfoItem label="Ngày tạo">{formatDateTime(ncr.createdAt)}</InfoItem>
        <InfoItem label="Người duyệt">
          {ncr.approverBy?.fullName ?? "—"}
        </InfoItem>
        <InfoItem label="Ngày duyệt">{formatDateTime(ncr.approvedAt)}</InfoItem>
      </dl>
    </NcrSectionCard>
  )
}
