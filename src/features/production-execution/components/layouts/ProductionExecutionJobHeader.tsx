import { DateTime } from "luxon"
import {
  AltArrowLeft,
  Buildings2,
  CalendarAdd,
  Delivery,
  Document,
  Flag,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { LinkButton } from "@/components/ui/button"
import { formatJobOperationDueDate } from "@/components/shared/composites/JobOperationDueDateCell"
import {
  ProductionExecutionImageCell,
  ProductionExecutionJobLifecycleBadge,
} from "@/features/production-execution/components/primitives/ProductionExecutionJobTableCells"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"
import type { FileResource } from "@/lib/types/file.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionExecutionJobHeaderProps = {
  job: ProductionJobDetail
  image: FileResource | null
  revision: string | undefined
  operationId: string | undefined
  // Hạn hoàn thành của công đoạn đang chọn (muộn nhất qua các Part) — null khi chưa đặt hạn.
  dueDate: string | null
  isDueDateOverdue: boolean
}

// Khối định danh của Job — cùng khuôn ProductDetailHeader.tsx (nút quay lại, ảnh nhỏ, mã + badge
// trạng thái, dòng meta ngăn bằng dấu chấm) rồi một dải 5 ô thông tin ngăn bằng đường kẻ.
export function ProductionExecutionJobHeader({
  job,
  image,
  revision,
  operationId,
  dueDate,
  isDueDateOverdue,
}: ProductionExecutionJobHeaderProps) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LinkButton
          to="/manage/production-execution"
          search={{ page: 1, limit: 10, operationId }}
          variant="ghost"
          className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách Job"
        >
          <AltArrowLeft className="size-4" />
          Quay lại
        </LinkButton>
        <span className="text-xs text-muted-foreground">
          Cập nhật lần cuối:{" "}
          {DateTime.fromISO(job.updatedAt).toFormat("dd/MM/yyyy HH:mm")}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex aspect-square w-44 shrink-0 items-center justify-center self-start rounded-xl bg-muted/50 p-3 lg:w-52">
          <ProductionExecutionImageCell
            image={image}
            fit="contain"
            className="size-full rounded-lg border-0 bg-transparent"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                JOB
              </span>
              <span className="font-mono text-2xl font-bold text-foreground">
                {job.code}
              </span>
            </div>
            <ProductionExecutionJobLifecycleBadge status={job.status} />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto_auto]">
            <HeaderField
              label="Mã sản phẩm (Tổng)"
              value={job.item.code}
              mono
            />
            <HeaderField label="Tên sản phẩm" value={job.item.name} />
            <HeaderField
              label="Revision"
              value={revision ?? "—"}
              className="lg:border-l lg:pl-6"
            />
            <HeaderField
              label="Số lượng (PO)"
              value={`${quantityFormatter.format(job.quantity)} pcs`}
              className="lg:border-l lg:pl-6"
            />
          </dl>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <InfoCell icon={Document} label="PO" value={job.order.code} mono />
            <InfoCell
              icon={Buildings2}
              label="Khách hàng"
              value={job.client?.name ?? "—"}
            />
            <InfoCell
              icon={CalendarAdd}
              label="Ngày đặt hàng"
              value={formatJobOperationDueDate(job.order.orderDate)}
            />
            <InfoCell
              icon={Delivery}
              label="Ngày giao (PO)"
              value={formatJobOperationDueDate(job.order.dueDate)}
            />
            <InfoCell
              icon={Flag}
              label="Hạn hoàn thành (JOB)"
              value={formatJobOperationDueDate(dueDate)}
              isDanger={isDueDateOverdue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type HeaderFieldProps = {
  label: string
  value: string
  mono?: boolean
  className?: string
}

function HeaderField({ label, value, mono, className }: HeaderFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        title={value}
        className={cn(
          "mt-0.5 truncate text-base font-semibold text-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

type InfoCellProps = {
  icon: ComponentType<IconProps>
  label: string
  value: string
  mono?: boolean
  isDanger?: boolean
}

function InfoCell({ icon: Icon, label, value, mono, isDanger }: InfoCellProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl p-3",
        isDanger ? "bg-destructive/10" : "bg-muted/50"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isDanger
            ? "bg-destructive/15 text-destructive"
            : "bg-background text-primary"
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-[11px]",
            isDanger ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p
          title={value}
          className={cn(
            "truncate text-sm font-semibold",
            mono && "font-mono",
            isDanger ? "text-destructive" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
