import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { productionOrderQueryOptions } from "@/features/production-orders/api"
import { ProductionJobLogSection } from "@/features/production-jobs/components/sections/ProductionJobLogSection"
import { ProductionJobNotesSection } from "@/features/production-jobs/components/sections/ProductionJobNotesSection"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

type ProductionJobInfoTabProps = {
  productionJob: ProductionJobDetail
}

// "Thông tin chung" tab — main column of flat sections split by rules (no card-in-card: the page
// already sits in one `Surface`, see ProductionJobDetailPage.tsx), notes aside on the right.
// Header (ProductionJobDetailHeader.tsx) already shows Sản phẩm/Khách hàng/PO/SL/Ngày giao, so
// this tab only adds what the header doesn't: linked documents, customer contact, change history.
export function ProductionJobInfoTab({
  productionJob,
}: ProductionJobInfoTabProps) {
  // Mã LSX không có trên GET /production-jobs/:jobId (chỉ có productionOrderId dạng UUID) — đọc
  // riêng qua production-orders, client-side, không chặn paint của tab.
  const productionOrderQuery = useQuery(
    productionOrderQueryOptions(productionJob.productionOrderId)
  )
  const { client, order } = productionJob

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 divide-y divide-border">
        <InfoSection title="Chứng từ liên quan">
          <InfoField
            label="Lệnh sản xuất"
            mono
            value={
              <Link
                to="/manage/production-orders/$productionOrderId"
                params={{ productionOrderId: productionJob.productionOrderId }}
                className="text-primary hover:underline"
              >
                {productionOrderQuery.isPending
                  ? "…"
                  : (productionOrderQuery.data?.code ?? "—")}
              </Link>
            }
          />
          <InfoField
            label="Đơn hàng"
            mono
            value={
              <Link
                to="/manage/orders/$orderId"
                params={{ orderId: order.id }}
                className="text-primary hover:underline"
              >
                {order.code}
              </Link>
            }
          />
          <InfoField
            label="Ngày đặt hàng"
            value={DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
          />
          <InfoField
            label="Cập nhật lần cuối"
            value={DateTime.fromISO(productionJob.updatedAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
          <InfoField
            className="col-span-full"
            label="Ghi chú đơn hàng"
            wrap
            value={order.note || "Chưa có ghi chú"}
          />
        </InfoSection>

        {client && (
          <InfoSection title="Liên hệ khách hàng">
            <InfoField label="Mã số thuế" mono value={client.taxCode ?? "—"} />
            <InfoField
              label="Điện thoại"
              mono
              value={client.phoneNumber ?? "—"}
            />
            <InfoField
              className="col-span-2"
              label="Email"
              value={client.email ?? "—"}
            />
            <InfoField
              className="col-span-full"
              label="Địa chỉ"
              wrap
              value={client.address ?? "—"}
            />
          </InfoSection>
        )}

        <section className="py-5">
          <SectionTitle className="px-4 sm:px-5">Lịch sử thay đổi</SectionTitle>
          <ProductionJobLogSection productionJobId={productionJob.id} />
        </section>
      </div>

      <aside className="min-w-0 border-t border-border py-5 xl:border-t-0 xl:border-l">
        <SectionTitle className="px-4 sm:px-5">Ghi chú</SectionTitle>
        <div className="px-4 sm:px-5">
          <ProductionJobNotesSection productionJobId={productionJob.id} />
        </div>
      </aside>
    </div>
  )
}

function SectionTitle({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <h3
      className={cn(
        "mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </h3>
  )
}

function InfoSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="px-4 py-5 sm:px-5">
      <SectionTitle>{title}</SectionTitle>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
        {children}
      </dl>
    </section>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
  wrap?: boolean
  className?: string
}

function InfoField({ label, value, mono, wrap, className }: InfoFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm font-semibold text-foreground",
          wrap ? "break-words" : "truncate",
          mono && "font-mono"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
