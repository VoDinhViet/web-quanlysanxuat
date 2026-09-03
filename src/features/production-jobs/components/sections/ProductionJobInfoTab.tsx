import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import {
  Bill,
  Buildings2,
  CalendarAdd,
  ClockCircle,
  DocumentText,
  Documents,
  Hashtag,
  History,
  InfoCircle,
  Letter,
  MapPoint,
  Notes,
  Phone,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { productionOrderQueryOptions } from "@/features/production-orders/api"
import { ProductionJobLogSection } from "@/features/production-jobs/components/sections/ProductionJobLogSection"
import { ProductionJobNotesSection } from "@/features/production-jobs/components/sections/ProductionJobNotesSection"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobInfoTabProps = {
  productionJob: ProductionJobDetail
}

// "Thông tin chung" tab — các khối tách nhau bằng đường kẻ (`divide-y`/`divide-x`), không phải
// card lồng card: trang đã nằm trong 1 `Surface` (ProductionJobDetailPage.tsx), một `shadow-card`/
// `rounded-lg border` thứ hai quanh từng khối ở đây sẽ là card-trong-card. Vẫn xếp theo lưới thật
// (không phải chuỗi dọc 1 cột) để tận dụng chiều ngang.
//
// Header (ProductionJobDetailHeader.tsx) đã hiện Sản phẩm/Khách hàng/PO/SL/Ngày giao — tab này
// không lặp lại. 3 khối nhỏ cùng hàng trên cùng (Chi tiết Job/Đơn hàng/Khách hàng) gom những
// trường header chưa hiện, rồi tới "Lịch sử thay đổi" (production_job_logs — log đầy đủ từng
// hành động/actor, có phân trang) full width dưới cùng. Cột phụ giữ "Ghi chú" như cũ.
export function ProductionJobInfoTab({
  productionJob,
}: ProductionJobInfoTabProps) {
  // Mã LSX không có trên GET /production-jobs/:jobId (chỉ có productionOrderId dạng UUID) — đọc
  // riêng qua production-orders, client-side, không chặn paint của tab (giống cách BOM/Operations
  // tab tự đọc dữ liệu riêng).
  const productionOrderQuery = useQuery(
    productionOrderQueryOptions(productionJob.productionOrderId)
  )
  const { client, order } = productionJob

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 divide-y divide-border">
        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <InfoSection title="Chi tiết Job" icon={InfoCircle}>
            <dl>
              <SummaryRow
                icon={DocumentText}
                label="LSX"
                value={
                  <Link
                    to="/manage/production-orders/$productionOrderId"
                    params={{
                      productionOrderId: productionJob.productionOrderId,
                    }}
                    className="text-primary hover:underline"
                  >
                    {productionOrderQuery.isPending
                      ? "…"
                      : (productionOrderQuery.data?.code ?? "—")}
                  </Link>
                }
                mono
              />
              <SummaryRow
                icon={Bill}
                label="Đơn hàng"
                value={
                  <Link
                    to="/manage/orders/$orderId"
                    params={{ orderId: order.id }}
                    className="text-primary hover:underline"
                  >
                    {order.code}
                  </Link>
                }
                mono
              />
              <SummaryRow
                icon={ClockCircle}
                label="Cập nhật lần cuối"
                value={DateTime.fromISO(productionJob.updatedAt).toFormat(
                  "dd/MM/yyyy HH:mm"
                )}
              />
            </dl>
          </InfoSection>

          <InfoSection title="Đơn hàng" icon={Documents}>
            <dl>
              <SummaryRow
                icon={CalendarAdd}
                label="Ngày đặt hàng"
                value={DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
              />
            </dl>
            <div className="border-t border-border px-4 py-3 sm:px-5">
              <p className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <Notes className="size-3.5 shrink-0" />
                Ghi chú đơn hàng
              </p>
              <p className="mt-1.5 text-xs font-medium break-words text-foreground">
                {order.note || "Chưa có ghi chú"}
              </p>
            </div>
          </InfoSection>

          {client && (
            <InfoSection title="Khách hàng" icon={Buildings2}>
              <dl>
                <SummaryRow
                  icon={Hashtag}
                  label="MST"
                  value={client.taxCode ?? "—"}
                  mono
                />
                <SummaryRow
                  icon={Phone}
                  label="SĐT"
                  value={client.phoneNumber ?? "—"}
                  mono
                />
                <SummaryRow
                  icon={Letter}
                  label="Email"
                  value={client.email ?? "—"}
                />
                <SummaryRow
                  icon={MapPoint}
                  label="Địa chỉ"
                  value={client.address ?? "—"}
                />
              </dl>
            </InfoSection>
          )}
        </div>

        <InfoSection title="Lịch sử thay đổi" icon={History}>
          <ProductionJobLogSection productionJobId={productionJob.id} />
        </InfoSection>
      </div>

      <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
        <InfoSection title="Ghi chú" icon={Notes}>
          <div className="p-4 sm:p-5">
            <ProductionJobNotesSection productionJobId={productionJob.id} />
          </div>
        </InfoSection>
      </aside>
    </div>
  )
}

type InfoSectionProps = {
  title: string
  icon: ComponentType<IconProps>
  children: ReactNode
}

function InfoSection({
  title,
  icon: IconComponent,
  children,
}: InfoSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <IconComponent className="size-3.5 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  )
}

type SummaryRowProps = {
  icon: ComponentType<IconProps>
  label: string
  value: ReactNode
  mono?: boolean
}

function SummaryRow({
  icon: IconComponent,
  label,
  value,
  mono,
}: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 px-4 py-3 sm:px-5">
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <IconComponent className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd
        className={
          mono
            ? "font-mono text-sm font-semibold break-words text-foreground"
            : "text-sm font-semibold break-words text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
