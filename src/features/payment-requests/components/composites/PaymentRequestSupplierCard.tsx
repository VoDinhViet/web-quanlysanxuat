import { Link } from "@tanstack/react-router"
import { Building2 } from "lucide-react"

import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestSupplierCardProps = {
  paymentRequest: PaymentRequestDetail
}

// Sidebar card — "Nhà cung cấp". Dời ra khỏi PaymentRequestDetailHeader.tsx's meta grid (đã chật
// 9 ô) và bổ sung mã NCC + email vốn có trên wire nhưng trước đây không hiện ở đâu. Cùng
// section/border idiom as PaymentRequestInfoCard.tsx. Link sang chi tiết NCC là cross-feature
// link đầu tiên tới route đó, nên bọc RoutePermissionGate — không giả định người xem YCTT cũng có
// quyền "suppliers:read".
export function PaymentRequestSupplierCard({
  paymentRequest,
}: PaymentRequestSupplierCardProps) {
  const { supplier } = paymentRequest

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Building2 className="size-4 text-muted-foreground" />
        Nhà cung cấp
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Mã NCC
          </p>
          <p className="text-sm font-medium text-foreground">
            <RoutePermissionGate
              route="/manage/suppliers/$supplierId"
              fallback={<span className="font-mono">{supplier.code}</span>}
            >
              <Link
                to="/manage/suppliers/$supplierId"
                params={{ supplierId: supplier.id }}
                className="font-mono text-primary hover:underline"
              >
                {supplier.code}
              </Link>
            </RoutePermissionGate>
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Tên
          </p>
          <p className="text-sm font-medium text-foreground">{supplier.name}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Địa chỉ
          </p>
          <p className="text-sm text-foreground">{supplier.address}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Điện thoại
          </p>
          <p className="text-sm text-foreground">{supplier.phoneNumber}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Email
          </p>
          <p className="text-sm text-foreground">{supplier.email ?? "—"}</p>
        </div>
      </div>
    </section>
  )
}
