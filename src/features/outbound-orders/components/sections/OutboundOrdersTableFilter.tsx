import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClientCombobox } from "@/components/shared/composites/ClientCombobox"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import {
  FilterField,
  SelectFilterField,
  TextFilterField,
} from "@/features/outbound-orders/components/composites/OutboundOrdersFilterFields"
import { OutboundOrdersTableActions } from "@/features/outbound-orders/components/composites/OutboundOrdersTableActions"
import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import {
  fulfillmentTypeLabels,
  outboundOrderStatusLabels,
} from "@/lib/types/outbound-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusFilterOptions = buildOptionsFromLabels(outboundOrderStatusLabels)
const fulfillmentTypeFilterOptions = buildOptionsFromLabels(
  fulfillmentTypeLabels
)

// Giá trị các ô lọc trên form: ô chữ giữ chuỗi (rỗng = chưa nhập), ô chọn giữ `undefined` = "Tất cả".
type OutboundOrdersFilters = {
  q: string
  clientId?: string
  poNo: string
  status?: string
  fulfillmentType?: string
  itemCode: string
  itemName: string
  startDate: string
  endDate: string
}

const getFiltersFromSearch = (
  search: Partial<OutboundOrdersSearchSchema>
): OutboundOrdersFilters => ({
  q: search.q ?? "",
  clientId: search.clientId,
  poNo: search.poNo ?? "",
  status: search.status,
  fulfillmentType: search.fulfillmentType,
  itemCode: search.itemCode ?? "",
  itemName: search.itemName ?? "",
  startDate: search.startDate ?? "",
  endDate: search.endDate ?? "",
})

const emptyFilters = getFiltersFromSearch({})

// Sửa các ô xong bấm "Tìm kiếm" (hoặc Enter) mới đẩy lên URL và tải lại danh sách.
export function OutboundOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders/" })
  const navigate = useNavigate({ from: "/manage/outbound-orders/" })

  const [filters, setFilters] = useState(() => getFiltersFromSearch(search))

  const patchFilters = (patch: Partial<OutboundOrdersFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  // Đi qua chính schema search của route: chuỗi rỗng/giá trị lạ tự thành `undefined` (`.catch`), nên
  // không cần ép kiểu enum hay tự trim từng ô.
  const applyFilters = (values: OutboundOrdersFilters) => {
    const parsed = outboundOrdersSearchSchema.parse(values)
    void navigate({
      search: (prev) => ({
        ...prev,
        q: parsed.q,
        clientId: parsed.clientId,
        poNo: parsed.poNo,
        status: parsed.status,
        fulfillmentType: parsed.fulfillmentType,
        itemCode: parsed.itemCode,
        itemName: parsed.itemName,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
    setFilters(emptyFilters)
    applyFilters(emptyFilters)
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <OutboundOrdersTableActions search={search} />

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          applyFilters(filters)
        }}
      >
        <div className="grid grid-cols-1 items-end gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-5">
          <TextFilterField
            id="do-q"
            label="Mã DO"
            placeholder="Nhập mã DO"
            value={filters.q}
            onValueChange={(q) => patchFilters({ q })}
          />

          <FilterField label="Khách hàng" htmlFor="client-combobox">
            <ClientCombobox
              selectedClientId={filters.clientId}
              onSelectClient={(clientId) => patchFilters({ clientId })}
            />
          </FilterField>

          <TextFilterField
            id="do-po-no"
            label="PO / Lý do"
            placeholder="Nhập số PO"
            value={filters.poNo}
            onValueChange={(poNo) => patchFilters({ poNo })}
          />

          <SelectFilterField
            id="do-status"
            label="Trạng thái"
            options={statusFilterOptions}
            value={filters.status}
            onValueChange={(status) => patchFilters({ status })}
          />

          <SelectFilterField
            id="do-fulfillment-type"
            label="Hình thức giao"
            options={fulfillmentTypeFilterOptions}
            value={filters.fulfillmentType}
            onValueChange={(fulfillmentType) =>
              patchFilters({ fulfillmentType })
            }
          />

          <TextFilterField
            id="do-item-code"
            label="Mã sản phẩm"
            placeholder="Nhập mã sản phẩm"
            value={filters.itemCode}
            onValueChange={(itemCode) => patchFilters({ itemCode })}
          />

          <TextFilterField
            id="do-item-name"
            label="Tên sản phẩm"
            placeholder="Nhập tên sản phẩm"
            value={filters.itemName}
            onValueChange={(itemName) => patchFilters({ itemName })}
          />

          <FilterField label="Từ ngày">
            <DatePicker
              value={filters.startDate}
              onChange={(startDate) => patchFilters({ startDate })}
            />
          </FilterField>

          <FilterField label="Đến ngày">
            <DatePicker
              value={filters.endDate}
              onChange={(endDate) => patchFilters({ endDate })}
            />
          </FilterField>

          <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              onClick={resetFilters}
            >
              <RotateCw className="size-4" />
              Xóa bộ lọc
            </Button>
            <Button type="submit" className="flex-1 text-xs">
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
