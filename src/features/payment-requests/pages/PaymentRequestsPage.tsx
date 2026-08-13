import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CreditCard } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { paymentRequestsQueryOptions } from "@/features/payment-requests/api/options"
import { paymentRequestsColumns } from "@/features/payment-requests/components/PaymentRequestsTableColumns"
import { PaymentRequestsTableFilter } from "@/features/payment-requests/components/PaymentRequestsTableFilter"

export function PaymentRequestsPage() {
  const search = useSearch({ from: "/(authed)/manage_/payment-requests" })

  const paymentRequestsQuery = useQuery({
    ...paymentRequestsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Yêu cầu thanh toán"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Yêu cầu thanh toán" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <PaymentRequestsTableFilter />

          {paymentRequestsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : paymentRequestsQuery.isError ? (
            <TableQueryError
              error={paymentRequestsQuery.error.message}
              onRetry={() => void paymentRequestsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={paymentRequestsQuery.data.data}
              columns={paymentRequestsColumns}
              pagination={paymentRequestsQuery.data.pagination}
              isPending={paymentRequestsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={CreditCard}
                  title="Chưa có yêu cầu thanh toán nào"
                  description="Yêu cầu thanh toán sẽ hiển thị tại đây sau khi được tạo từ đơn mua hàng đã hoàn tất nhập hàng."
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
