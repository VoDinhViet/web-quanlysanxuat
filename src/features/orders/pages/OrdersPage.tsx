import { useCallback, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { OrderStatCards } from "@/features/orders/components/sections/OrderStatCards"
import { OrderStatusLegend } from "@/features/orders/components/primitives/OrderStatusLegend"
import { OrdersTable } from "@/features/orders/components/sections/OrdersTable"
import { OrdersTableFilter } from "@/features/orders/components/sections/OrdersTableFilter"
import { OrdersTableBulkActions } from "@/features/orders/components/composites/OrdersTableBulkActions"
import { ordersQueryOptions } from "@/features/orders/api/options"
import { exportOrdersSummaryPdf } from "@/features/orders/api/server-functions/export-orders-summary-pdf.api"
import { exportOrdersExcel } from "@/features/orders/api/server-functions/export-orders-excel.api"
import {
  downloadBase64File,
  PDF_MIME_TYPE,
  XLSX_MIME_TYPE,
} from "@/lib/download-file"

export function OrdersPage() {
  // useSearch keys off the file-based route id. The loader prefetches this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. Order stats are non-critical — OrderStatCards
  // reads and awaits them itself. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/orders/" })

  const ordersQuery = useQuery({
    ...ordersQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    () => new Set()
  )

  const orders = ordersQuery.data?.data ?? []

  const handleToggleOrder = useCallback((orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }, [])

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        for (const order of orders) {
          if (checked) {
            next.add(order.id)
          } else {
            next.delete(order.id)
          }
        }
        return next
      })
    },
    [orders]
  )

  const handleSelectAllPage = useCallback(() => {
    setSelectedOrderIds(
      (prev) => new Set([...prev, ...orders.map((o) => o.id)])
    )
  }, [orders])

  const handleClearSelection = useCallback(() => {
    setSelectedOrderIds(new Set())
  }, [])

  const exportOrdersSummaryPdfFn = useServerFn(exportOrdersSummaryPdf)
  const exportOrdersExcelFn = useServerFn(exportOrdersExcel)

  const { mutateAsync: exportPdf, isPending: isExportingForm } = useMutation({
    mutationFn: () => {
      if (selectedOrderIds.size === 0) {
        throw new Error(
          "Vui lòng tích chọn ít nhất 1 đơn hàng để xuất biểu mẫu."
        )
      }
      return exportOrdersSummaryPdfFn({
        data: {
          orderIds: Array.from(selectedOrderIds),
        },
      })
    },
  })

  const handleExportOrdersForm = () => {
    toast.promise(
      exportPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo biểu mẫu danh sách đơn hàng...",
        success: "Đã xuất biểu mẫu danh sách đơn hàng (BM-03/KD)",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  const { mutateAsync: exportExcel, isPending: isExportingExcel } = useMutation(
    {
      mutationFn: () => {
        if (selectedOrderIds.size === 0) {
          throw new Error(
            "Vui lòng tích chọn ít nhất 1 đơn hàng để xuất Excel."
          )
        }
        return exportOrdersExcelFn({
          data: {
            orderIds: Array.from(selectedOrderIds),
          },
        })
      },
    }
  )

  const handleExportOrdersExcel = () => {
    toast.promise(
      exportExcel().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      }),
      {
        loading: "Đang xuất danh sách đơn hàng ra file Excel...",
        success: "Đã xuất danh sách đơn hàng ra file Excel",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  const allPageChecked =
    orders.length > 0 && orders.every((order) => selectedOrderIds.has(order.id))

  return (
    <div className="flex w-full flex-col gap-4 p-4 pb-20 sm:p-5 lg:p-6">
      <OrderStatCards />

      <Surface contentClassName="min-h-[calc(100svh-25rem)]">
        <OrdersTableFilter
          selectedOrderCount={selectedOrderIds.size}
          onExportOrdersForm={handleExportOrdersForm}
          onExportOrdersExcel={handleExportOrdersExcel}
          onClearSelection={handleClearSelection}
          isExportingForm={isExportingForm}
          isExportingExcel={isExportingExcel}
        />

        {ordersQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : ordersQuery.isError ? (
          <TableQueryError
            error={ordersQuery.error.message}
            onRetry={() => void ordersQuery.refetch()}
          />
        ) : (
          <OrdersTable
            rows={orders}
            pagination={ordersQuery.data.pagination}
            isPending={ordersQuery.isFetching}
            selectedOrderIds={selectedOrderIds}
            onToggleOrder={handleToggleOrder}
            onToggleAll={handleToggleAll}
          />
        )}
      </Surface>

      <OrderStatusLegend />

      <OrdersTableBulkActions
        selectedCount={selectedOrderIds.size}
        allPageChecked={allPageChecked}
        currentPageCount={orders.length}
        isExportingForm={isExportingForm}
        isExportingExcel={isExportingExcel}
        onSelectAllPage={handleSelectAllPage}
        onClearSelection={handleClearSelection}
        onExportForm={handleExportOrdersForm}
        onExportExcel={handleExportOrdersExcel}
      />
    </div>
  )
}
