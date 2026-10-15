import { Link } from "@tanstack/react-router"
import { Gallery } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { resolveFileUrl } from "@/lib/file-url"
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
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words text-foreground">
        {children}
      </dd>
    </div>
  )
}

function formatDateTime(isoDate: string | null): string {
  return isoDate ? DateTime.fromISO(isoDate).toFormat("dd/MM/yyyy HH:mm") : "—"
}

export function NcrInfoCard({ ncr }: NcrInfoCardProps) {
  const { item } = ncr

  return (
    <NcrSectionCard
      title="Thông tin chung"
      description="Sản phẩm, đơn hàng và bộ phận phát sinh lỗi của phiếu NCR"
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
          {item.image ? (
            <ZoomableImage
              src={resolveFileUrl(item.image.url)}
              alt={item.name}
            />
          ) : (
            <Gallery className="size-8 text-muted-foreground/50" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Sản phẩm
            </p>
            <p className="text-base font-medium text-foreground">{item.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {item.code}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Khách hàng">{ncr.client?.name ?? "—"}</InfoItem>
            <InfoItem label="Đơn hàng (SO)">
              {ncr.order ? (
                <Link
                  to="/manage/orders/$orderId"
                  params={{ orderId: ncr.order.id }}
                  className="font-mono text-primary hover:underline"
                >
                  {ncr.order.code}
                </Link>
              ) : (
                "—"
              )}
            </InfoItem>
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
            <InfoItem label="Bộ phận phát sinh">
              {ncr.department?.name ?? "—"}
            </InfoItem>
            <InfoItem label="Nguồn">
              {ncrOriginTypeLabels[ncr.originType]}
            </InfoItem>
            <InfoItem label="Ngày tạo">
              {formatDateTime(ncr.createdAt)}
            </InfoItem>
            <InfoItem label="Duyệt bởi">
              {ncr.approverBy ? (
                <>
                  {ncr.approverBy.fullName}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {formatDateTime(ncr.approvedAt)}
                  </span>
                </>
              ) : (
                "Chưa duyệt"
              )}
            </InfoItem>
          </dl>
        </div>
      </div>
    </NcrSectionCard>
  )
}
