import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { ClipboardPen, FileOutput, RotateCw } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { mockDepartmentOptions } from "@/features/material-issues/mock/material-issues.mock"
import type { MaterialIssueStatus } from "@/lib/types/material-issue.type"
import { materialIssueStatusLabels } from "@/lib/types/material-issue.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const departmentOptions = [
  { value: "all", label: "Tất cả" },
  ...mockDepartmentOptions,
]

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(materialIssueStatusLabels),
]

export function MaterialIssuesTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/material-issues" })
  const navigate = useNavigate({ from: "/manage/material-issues" })
  const [q, setQ] = useState(search.q ?? "")
  const [code, setCode] = useState(search.code ?? "")
  const [reason, setReason] = useState(search.reason ?? "")
  const [jobCode, setJobCode] = useState(search.jobCode ?? "")

  const handleSearch = useDebounceCallback((term: string) => {
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

  const handleCodeChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        code: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleReasonChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        reason: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleJobCodeChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        jobCode: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleDepartmentChange = (value: string) => {
    const departmentId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, departmentId, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as MaterialIssueStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    handleSearch.cancel()
    handleCodeChange.cancel()
    handleReasonChange.cancel()
    handleJobCodeChange.cancel()
    setQ("")
    setCode("")
    setReason("")
    setJobCode("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          code: _code,
          reason: _reason,
          jobCode: _jobCode,
          departmentId: _departmentId,
          status: _status,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-5 bg-card px-4 py-4 lg:px-5">
      {/* Top creation section */}
      <div className="border-b border-border/60 pb-4">
        <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Tạo phiếu lãnh
        </p>
        <div className="flex flex-wrap gap-2">
          <PendingAction
            label="Lãnh từ LSX"
            hint="Tính năng tạo phiếu lãnh từ LSX sắp có"
            variant="default"
          >
            <FileOutput className="size-3.5" />
            Lãnh từ LSX
          </PendingAction>
          <PendingAction
            label="Lãnh thủ công"
            hint="Tính năng tạo phiếu lãnh thủ công sắp có"
          >
            <ClipboardPen className="size-3.5" />
            Lãnh thủ công
          </PendingAction>
        </div>
      </div>

      {/* Filters section */}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.2fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          {/* Từ khóa */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="lv-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Từ khóa
            </Label>
            <Input
              id="lv-search"
              className="text-xs placeholder:text-muted-foreground/75"
              placeholder="Nhập mã, tên vật tư..."
              value={q}
              onChange={(event) => {
                setQ(event.target.value)
                handleSearch(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSearch.flush()
                }
              }}
            />
          </div>

          {/* Mã phiếu lãnh */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-code"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Mã phiếu lãnh
            </Label>
            <Input
              id="lv-code"
              className="text-xs placeholder:text-muted-foreground/75"
              placeholder="Nhập mã phiếu lãnh..."
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                handleCodeChange(event.target.value)
              }}
            />
          </div>

          {/* PO / Lý do */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-reason"
              className="text-[11px] font-medium text-muted-foreground"
            >
              PO / Lý do
            </Label>
            <Input
              id="lv-reason"
              className="text-xs placeholder:text-muted-foreground/75"
              placeholder="Nhập PO hoặc lý do..."
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                handleReasonChange(event.target.value)
              }}
            />
          </div>

          {/* Job */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-job"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Job
            </Label>
            <Input
              id="lv-job"
              className="text-xs placeholder:text-muted-foreground/75"
              placeholder="Nhập mã Job..."
              value={jobCode}
              onChange={(event) => {
                setJobCode(event.target.value)
                handleJobCodeChange(event.target.value)
              }}
            />
          </div>

          {/* Bộ phận */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-department"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Bộ phận
            </Label>
            <Select
              value={search.departmentId ?? "all"}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger id="lv-department" className="w-full text-xs">
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

          {/* Trạng thái */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="lv-status" className="w-full text-xs">
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
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
