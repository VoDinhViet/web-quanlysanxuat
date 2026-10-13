import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { departmentQueryOptions } from "@/features/departments/api"
import { ncrStatusLabels, ncrTypeLabels } from "@/lib/types/ncr.type"
import type { NcrStatus, NcrType } from "@/lib/types/ncr.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(ncrStatusLabels),
]

const typeOptions: SelectOption[] = [
  { value: "all", label: "Tất cả loại" },
  ...buildOptionsFromLabels(ncrTypeLabels),
]

export function NcrsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/ncrs/" })
  const navigate = useNavigate({ from: "/manage/ncrs/" })

  const [q, setQ] = useState(search.q ?? "")

  const { data: departments = [] } = useQuery(departmentQueryOptions())
  const departmentOptions: SelectOption[] = [
    { value: "all", label: "Tất cả bộ phận" },
    ...buildSelectOptions(departments),
  ]

  const handleQChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const resetFilters = () => {
    handleQChange.cancel()
    setQ("")
    void navigate({ search: () => ({ page: 1, limit: search.limit }) })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-card px-4 py-4 lg:px-5">
      <div className="w-56 space-y-1.5">
        <Label
          htmlFor="ncr-q"
          className="text-xs font-medium text-muted-foreground"
        >
          Mã NCR
        </Label>
        <div className="relative">
          <Input
            id="ncr-q"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Nhập mã NCR..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              handleQChange(event.target.value)
            }}
          />
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="flex w-40 flex-col gap-1.5">
        <Label
          htmlFor="ncr-type"
          className="text-xs font-medium text-muted-foreground"
        >
          Loại NCR
        </Label>
        <Select
          items={typeOptions}
          value={search.type ?? "all"}
          onValueChange={(value) =>
            value !== null &&
            void navigate({
              search: (prev) => ({
                ...prev,
                type: value === "all" ? undefined : (value as NcrType),
                page: 1,
              }),
            })
          }
        >
          <SelectTrigger id="ncr-type" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-40 flex-col gap-1.5">
        <Label
          htmlFor="ncr-status"
          className="text-xs font-medium text-muted-foreground"
        >
          Trạng thái
        </Label>
        <Select
          items={statusOptions}
          value={search.status ?? "all"}
          onValueChange={(value) =>
            value !== null &&
            void navigate({
              search: (prev) => ({
                ...prev,
                status: value === "all" ? undefined : (value as NcrStatus),
                page: 1,
              }),
            })
          }
        >
          <SelectTrigger id="ncr-status" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-48 flex-col gap-1.5">
        <Label
          htmlFor="ncr-department"
          className="text-xs font-medium text-muted-foreground"
        >
          Bộ phận phát sinh
        </Label>
        <Select
          items={departmentOptions}
          value={search.departmentId ?? "all"}
          onValueChange={(value) =>
            value !== null &&
            void navigate({
              search: (prev) => ({
                ...prev,
                departmentId: value === "all" ? undefined : value,
                page: 1,
              }),
            })
          }
        >
          <SelectTrigger id="ncr-department" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={resetFilters}
      >
        <RotateCw className="size-3.5" />
        Xóa bộ lọc
      </Button>

      <PermissionGate permission="ncr:create">
        <LinkButton
          to="/manage/ncrs/create"
          className="ml-auto gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          Tạo NCR
        </LinkButton>
      </PermissionGate>
    </div>
  )
}
