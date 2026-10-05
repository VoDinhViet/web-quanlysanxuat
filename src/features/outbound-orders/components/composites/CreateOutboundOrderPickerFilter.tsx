import { useState } from "react"
import { Delivery } from "@solar-icons/react"
import { ListFilter, RotateCw, Search } from "lucide-react"
import { useDebounceCallback } from "usehooks-ts"

import { ClientCombobox } from "@/components/shared/composites/ClientCombobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type CreateOutboundOrderPickerFilters = {
  clientId?: string
  poNo?: string
  jobCode?: string
  itemKeyword?: string
  deliverableOnly?: boolean
}

type CreateOutboundOrderPickerFilterProps = {
  filters: CreateOutboundOrderPickerFilters
  onChange: (filters: CreateOutboundOrderPickerFilters) => void
}

type TextFilterKey = "poNo" | "jobCode" | "itemKeyword"

const textFilterFields: {
  key: TextFilterKey
  label: string
  placeholder: string
}[] = [
  { key: "poNo", label: "PO", placeholder: "Nhập mã PO" },
  { key: "jobCode", label: "Job", placeholder: "Nhập mã Job" },
  {
    key: "itemKeyword",
    label: "Mã / Tên thành phẩm",
    placeholder: "Nhập mã hoặc tên thành phẩm",
  },
]

// Khung lọc của bước ① "Chọn PO/Job cần giao": Khách hàng, PO (số PO khách hoặc mã SO), Job, Mã/Tên
// thành phẩm; "Bộ lọc khác" gom công tắc chỉ hiện dòng còn có thể giao. Ô chữ giữ giá trị gõ ở
// state cục bộ và đẩy lên cha sau 300ms (cùng idiom `OutboundOrdersTableFilter.tsx`); bộ lọc chỉ
// thu hẹp danh sách, không đổi ràng buộc 1 khách hàng/phiếu của bước chọn.
export function CreateOutboundOrderPickerFilter({
  filters,
  onChange,
}: CreateOutboundOrderPickerFilterProps) {
  const [textValues, setTextValues] = useState({
    poNo: filters.poNo ?? "",
    jobCode: filters.jobCode ?? "",
    itemKeyword: filters.itemKeyword ?? "",
  })

  const emitText = useDebounceCallback(
    (next: Record<TextFilterKey, string>) => {
      onChange({
        ...filters,
        poNo: next.poNo.trim() || undefined,
        jobCode: next.jobCode.trim() || undefined,
        itemKeyword: next.itemKeyword.trim() || undefined,
      })
    },
    300
  )

  const handleTextChange = (key: TextFilterKey, value: string) => {
    setTextValues({ ...textValues, [key]: value })
    emitText({ ...textValues, [key]: value })
  }

  const resetFilters = () => {
    emitText.cancel()
    setTextValues({ poNo: "", jobCode: "", itemKeyword: "" })
    onChange({})
  }

  return (
    <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.2fr)_repeat(3,minmax(10rem,1fr))_auto]">
      <div className="space-y-1.5">
        <Label
          htmlFor="client-combobox"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Khách hàng
        </Label>
        <ClientCombobox
          selectedClientId={filters.clientId}
          onSelectClient={(clientId) => onChange({ ...filters, clientId })}
        />
      </div>

      {textFilterFields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label
            htmlFor={`do-picker-${field.key}`}
            className="text-[11px] font-medium text-muted-foreground"
          >
            {field.label}
          </Label>
          <div className="relative">
            <Input
              id={`do-picker-${field.key}`}
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder={field.placeholder}
              value={textValues[field.key]}
              onChange={(event) =>
                handleTextChange(field.key, event.target.value)
              }
            />
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "gap-1.5 text-xs",
                  filters.deliverableOnly &&
                    "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                )}
              >
                <ListFilter className="size-4" />
                Bộ lọc khác
                {filters.deliverableOnly && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-72">
            <div className="flex items-start gap-3">
              <Delivery
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  filters.deliverableOnly
                    ? "text-success"
                    : "text-muted-foreground"
                )}
              />
              <Label
                htmlFor="do-picker-deliverable-only"
                className="flex flex-1 cursor-pointer flex-col items-start gap-0.5 text-sm font-medium"
              >
                Chỉ hiện dòng có thể giao
                <span className="text-xs font-normal text-muted-foreground">
                  Ẩn dòng hết tồn hoặc đã bị DO khác giữ hết (Có thể giao &gt;
                  0).
                </span>
              </Label>
              <Switch
                id="do-picker-deliverable-only"
                className="mt-0.5"
                checked={filters.deliverableOnly ?? false}
                onCheckedChange={(checked) =>
                  onChange({
                    ...filters,
                    deliverableOnly: checked || undefined,
                  })
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          className="text-xs text-muted-foreground"
          onClick={resetFilters}
        >
          <RotateCw className="size-3.5" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  )
}
