import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { ClipboardMinus, Plus, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button, LinkButton } from "@/components/ui/button"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateProductionJobIssuesDialog } from "@/features/production-jobs/components/composites/CreateProductionJobIssuesDialog"
import { ProductionJobBomTable } from "@/features/production-jobs/components/composites/ProductionJobBomTable"
import { ProductionJobPlanNotice } from "@/features/production-jobs/components/primitives/ProductionJobPlanNotice"
import { productionJobBomQueryOptions } from "@/features/production-jobs/api/options"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { ProductionJobStatus } from "@/lib/types/production-job.type"

type ProductionJobBomTabProps = {
  productionJobId: string
  status: ProductionJobStatus
}

// Tab "BOM" — vật tư cần cho Job này, đọc trực tiếp GET /production-jobs/:jobId/bom
// (phân trang, cùng route tên "bom" nhưng trả bảng nhu cầu vật tư đã gộp kèm tiến độ xuất kho:
// số lượng đã lãnh `issuedQuantity` và còn lại `remainingQuantity` — xem doc comment ProductionJobIssue),
// cùng pattern client-driven useQuery với ProductIssuesTab.tsx. Các cột đọc snapshot text lồng trong
// `item`/`unit` (item.code/item.name/unit.name). Job `PENDING` đọc snapshot chụp lúc tạo Job (hoặc lúc
// "Tải lại từ sản phẩm"), chưa lãnh gì cho tới khi "Xác nhận kế hoạch".
export function ProductionJobBomTab({
  productionJobId,
  status,
}: ProductionJobBomTabProps) {
  const search = useSearch({
    from: "/(authed)/manage_/production-jobs_/$productionJobId",
  })
  const navigate = useNavigate({
    from: "/manage/production-jobs/$productionJobId",
  })

  const isPending = status === ProductionJobStatus.PENDING
  const page = search.page ?? 1
  const limit = search.limit ?? 10

  const bomQuery = useQuery({
    ...productionJobBomQueryOptions(productionJobId, {
      page,
      limit,
      q: search.q,
    }),
    placeholderData: keepPreviousData,
  })

  const handleSearchChange = (q: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, q, page: 1 }),
      replace: true,
    })
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductionJobBomFilter
        productionJobId={productionJobId}
        status={status}
        q={search.q}
        onSearchChange={handleSearchChange}
      />

      {isPending ? <ProductionJobPlanNotice /> : null}

      {bomQuery.isPending ? (
        <TableQueryLoading rows={limit} />
      ) : bomQuery.isError ? (
        <TableQueryError
          error={bomQuery.error.message}
          onRetry={() => void bomQuery.refetch()}
        />
      ) : (
        <ProductionJobBomTable
          productionJobId={productionJobId}
          status={status}
          rows={bomQuery.data.data}
          pagination={bomQuery.data.pagination}
        />
      )}
    </div>
  )
}

type ProductionJobBomFilterProps = {
  productionJobId: string
  status: ProductionJobStatus
  q: string | undefined
  onSearchChange: (q: string | undefined) => void
}

// "Thêm vật tư" ở đây, "Sửa"/"Xoá" theo từng dòng trong ProductionJobBomTable — chỉ mở khi Job
// `PENDING` (sửa riêng Job này, không đổi sản phẩm gốc); từ lúc "Xác nhận kế hoạch" khoá lại.
// "Lãnh vật tư cho Job" ngược lại: khoá khi `PENDING` — chưa được lãnh.
function ProductionJobBomFilter({
  productionJobId,
  status,
  q,
  onSearchChange,
}: ProductionJobBomFilterProps) {
  const [value, setValue] = useState(q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same delay as
  // the other list filters in this app.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange(trimmed.length > 0 ? trimmed : undefined)
  }, 300)

  return (
    <div className="flex items-center justify-between gap-3 bg-card px-4 py-4 lg:px-5">
      <label className="block max-w-sm flex-1 space-y-1.5">
        <span className="sr-only">Tìm kiếm vật tư</span>
        <div className="relative">
          <Input
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm kiếm theo mã, tên vật tư..."
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              handleSearch(event.target.value)
            }}
          />
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </label>

      <div className="flex items-center gap-2">
        {status === ProductionJobStatus.PENDING ? (
          <DisabledAction
            label="Lãnh vật tư cho Job"
            hint="Job chưa xác nhận kế hoạch"
          >
            <ClipboardMinus className="size-3.5" />
          </DisabledAction>
        ) : (
          <RoutePermissionGate route="/manage/inventory-requisitions/create">
            <LinkButton
              to="/manage/inventory-requisitions/create"
              search={{
                type: InventoryRequisitionType.PRODUCTION,
                productionJobId,
              }}
              className="gap-1.5 text-xs"
            >
              <ClipboardMinus className="size-3.5" />
              Lãnh vật tư cho Job
            </LinkButton>
          </RoutePermissionGate>
        )}

        {status === ProductionJobStatus.PENDING ? (
          <PermissionGate permission="production:update">
            <CreateProductionJobIssuesDialog
              productionJobId={productionJobId}
              trigger={
                <Button type="button" className="gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  Thêm vật tư
                </Button>
              }
            />
          </PermissionGate>
        ) : (
          <DisabledAction label="Thêm vật tư" hint="Job đã xác nhận kế hoạch">
            <Plus className="size-3.5" />
          </DisabledAction>
        )}
      </div>
    </div>
  )
}
