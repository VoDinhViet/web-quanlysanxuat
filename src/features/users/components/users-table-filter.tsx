import { Download, Filter, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UsersTableFilter() {
  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.8fr)_minmax(8rem,0.9fr)_minmax(8rem,0.9fr)_minmax(8rem,0.85fr)_auto]">
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm kiếm nhân sự</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo tên, email, SĐT, mã NV..."
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <FilterSelect label="Phòng ban" />
          <FilterSelect label="Chức vụ" />
          <FilterSelect label="Trạng thái" />

          <Button
            type="button"
            variant="outline"
            className="justify-center text-xs"
          >
            <Filter className="size-4" />
            Lọc nâng cao
          </Button>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
          <Button type="button" variant="outline" className="text-xs">
            <Download className="size-4" />
            Export
          </Button>
          <Button type="button" className="text-xs">
            <Plus className="size-4" />
            Thêm nhân sự
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label }: { label: string }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <Select defaultValue="all">
        <SelectTrigger className="w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Hoạt động</SelectItem>
          <SelectItem value="paused">Tạm ngưng</SelectItem>
        </SelectContent>
      </Select>
    </label>
  )
}
