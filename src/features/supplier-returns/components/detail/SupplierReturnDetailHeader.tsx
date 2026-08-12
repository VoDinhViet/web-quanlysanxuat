import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft, EllipsisVertical, Printer } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/DisabledAction"
import { SupplierReturnStatusBadge } from "@/features/supplier-returns/components/SupplierReturnBadges"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnDetailHeaderProps = {
  detail: SupplierReturnDetail
}

// Identity row + the one real action (In phiếu, window.print()) — same shell as
// PurchaseOrderDetailHeader.tsx / ProductDetailHeader.tsx. Hủy phiếu/Lưu/Xác nhận xuất live in
// the sticky SupplierReturnDetailActions footer instead (mirrors the mockup's In phiếu button
// appearing in both places).
export function SupplierReturnDetailHeader({
  detail,
}: SupplierReturnDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách trả NCC"
            asChild
          >
            <Link to="/manage/supplier-returns" search={{ page: 1, limit: 10 }}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <SupplierReturnStatusBadge status={detail.status} />
        </div>

        <MetaField
          label="Ngày tạo phiếu"
          value={DateTime.fromISO(detail.createdAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" />
          In phiếu
        </Button>
        <DisabledAction label="Thêm thao tác" hint="chưa có thao tác nào khác">
          <EllipsisVertical className="size-3.5" />
        </DisabledAction>
      </div>
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
