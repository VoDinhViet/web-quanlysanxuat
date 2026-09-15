import { Fragment, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Binary,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Contact,
  Edit3,
  ExternalLink,
  Eye,
  Factory,
  FileText,
  Layers,
  Minus,
  Navigation,
  Package,
  PlusCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { permissionCatalogueQueryOptions } from "@/features/roles/api/options"
import {
  permissionGroups as defaultGroups,
  permissionLabels as defaultLabels,
} from "@/lib/types/permission.type"
import type { PermissionCode } from "@/lib/types/permission.type"
import { cn } from "@/lib/utils"

const ACTIONS = [
  { key: "read", label: "XEM", icon: Eye },
  { key: "create", label: "TẠO", icon: PlusCircle },
  { key: "update", label: "SỬA", icon: Edit3 },
  { key: "approve", label: "DUYỆT", icon: CheckCircle2 },
  { key: "delete", label: "XOÁ", icon: Trash2 },
] as const

type ActionKey = (typeof ACTIONS)[number]["key"]

/** Icon trực quan, đơn giản cho từng phân hệ */
const RESOURCE_ICONS: Record<string, LucideIcon> = {
  users: Users,
  roles: ShieldCheck,
  departments: Building2,
  positions: Briefcase,
  clients: Contact,
  items: Package,
  operations: Layers,
  suppliers: Truck,
  orders: ShoppingCart,
  inventory: Warehouse,
  "inventory-requisitions": ClipboardList,
  production: Factory,
  "purchase-requests": FileText,
  purchasing: ShoppingBag,
  iqc: CheckCircle2,
  outsourcing: ExternalLink,
  oqc: ShieldAlert,
  "qc-aql": Binary,
  outbound: Navigation,
  reports: BarChart3,
}

/** Ánh xạ nhanh mã quyền vào cột hành động chuẩn */
function getAction(code: string): ActionKey {
  const action = code.split(":")[1] || ""
  if (action === "copy") return "create"
  if (action === "bom-manage") return "update"
  if (action === "issue") return "approve"
  if (
    action === "read" ||
    action === "create" ||
    action === "update" ||
    action === "approve" ||
    action === "delete"
  ) {
    return action
  }
  return "update"
}

export type RolePermissionsProps = {
  value: PermissionCode[]
  onChange: (value: PermissionCode[]) => void
  disabled?: boolean
}

/**
 * Component ma trận phân quyền tối giản, trực quan, đồng bộ trực tiếp từ BE API.
 */
export function RolePermissions({
  value = [],
  onChange,
  disabled,
}: RolePermissionsProps) {
  const { data: permissionCatalogue } = useQuery(
    permissionCatalogueQueryOptions()
  )
  const [filter, setFilter] = useState("")

  const selectedSet = useMemo(() => new Set(value), [value])

  // Chuẩn hóa danh sách phân hệ & quyền hạn từ BE API (fallback static)
  const groups = useMemo(() => {
    if (permissionCatalogue && permissionCatalogue.length > 0) {
      return permissionCatalogue.map((g) => ({
        resource: g.resource,
        label: g.label,
        description: g.description || "",
        codes: g.codes,
        permissions: g.permissions.map((p) => ({
          code: p.code as PermissionCode,
          action: getAction(p.code),
          label: p.label,
          description: p.description,
        })),
      }))
    }

    return defaultGroups
      .filter((g) => !g.codes.includes("system:manage"))
      .map((g) => {
        const resource = g.codes[0]?.split(":")[0] || ""
        return {
          resource,
          label: g.label,
          description: "",
          codes: g.codes,
          permissions: g.codes.map((c) => ({
            code: c,
            action: getAction(c),
            label: defaultLabels[c] || c,
            description: undefined,
          })),
        }
      })
  }, [permissionCatalogue])

  // Lọc theo từ khóa tìm kiếm
  const query = filter.trim().toLowerCase()
  const visibleGroups = useMemo(() => {
    if (!query) return groups
    return groups.filter(
      (g) =>
        g.label.toLowerCase().includes(query) ||
        g.resource.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.permissions.some(
          (p) =>
            p.label.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        )
    )
  }, [groups, query])

  // Tổng hợp mã quyền
  const visibleCodes = useMemo(
    () => visibleGroups.flatMap((g) => g.codes),
    [visibleGroups]
  )
  const totalCodes = useMemo(
    () => groups.flatMap((g) => g.codes).length,
    [groups]
  )
  const selectedCount = useMemo(
    () => value.filter((c) => c !== "system:manage").length,
    [value]
  )

  // Lấy toàn bộ mã quyền của một cột hành động đang hiển thị
  const getColCodes = (act: ActionKey) =>
    visibleGroups.flatMap((g) =>
      g.permissions.filter((p) => p.action === act).map((p) => p.code)
    )

  // Thao tác bật/tắt quyền
  const toggleOne = (code: PermissionCode, checked: boolean) => {
    onChange(checked ? [...value, code] : value.filter((c) => c !== code))
  }

  const toggleMultiple = (codes: PermissionCode[], checked: boolean) => {
    const targetSet = new Set(codes)
    if (checked) {
      onChange([...value, ...codes.filter((c) => !selectedSet.has(c))])
    } else {
      onChange(value.filter((c) => !targetSet.has(c)))
    }
  }

  return (
    <div className="w-full">
      {/* Tiêu đề & Bộ đếm quyền */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border bg-muted/30 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
            Bảng phân quyền chức năng
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Đã chọn:{" "}
          <strong className="font-semibold text-foreground tabular-nums">
            {selectedCount}
          </strong>
          /{totalCodes} quyền
        </span>
      </div>

      {/* Thanh công cụ: Tìm kiếm & Thao tác chọn nhanh */}
      <div className="flex flex-col gap-2.5 border-b border-border bg-card px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={disabled}
            placeholder="Tìm phân hệ, quyền hạn..."
            className="h-8 pr-7 pl-8 text-xs"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Xóa tìm kiếm"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => toggleMultiple(getColCodes("read"), true)}
            className="h-7.5 gap-1 px-2.5 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            <Eye className="size-3.5" />
            Chỉ quyền Xem
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => toggleMultiple(visibleCodes, true)}
            className="h-7.5 gap-1 px-2.5 text-xs"
          >
            <Check className="size-3.5" />
            Chọn tất cả
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || selectedCount === 0}
            onClick={() => toggleMultiple(visibleCodes, false)}
            className="h-7.5 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3" />
            Bỏ chọn
          </Button>
        </div>
      </div>

      {/* Bảng phân quyền 2 hàng */}
      <div className="overflow-x-auto">
        <table
          className="w-full table-fixed border-collapse text-left text-sm"
          aria-label="Bảng phân quyền"
        >
          <colgroup>
            <col className="w-[45%] min-w-[300px]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>

          <thead>
            <tr className="h-16 border-b border-border bg-muted/40 divide-x divide-border/60">
              <th className="px-4 py-2 text-xs font-semibold text-foreground align-middle">
                Phân hệ / Chức năng
              </th>

              {ACTIONS.map((col) => {
                const Icon = col.icon
                const codes = getColCodes(col.key)
                const checkedCount = codes.filter((c) => selectedSet.has(c)).length
                const allChecked = codes.length > 0 && checkedCount === codes.length
                const indeterminate = checkedCount > 0 && !allChecked

                return (
                  <th key={col.key} className="p-0 text-center align-middle">
                    {/* Header tiêu đề chữ tinh gọn, trang nhã, kèm icon */}
                    <div className="flex flex-col items-center justify-center gap-2 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                        <Icon className="size-3.5 text-muted-foreground" />
                        {col.label}
                      </span>
                      <CheckboxCell
                        checked={allChecked}
                        indeterminate={indeterminate}
                        disabled={disabled || codes.length === 0}
                        onChange={(chk) => toggleMultiple(codes, chk)}
                        label={`Chọn toàn bộ quyền ${col.label}`}
                      />
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50">
            {visibleGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-xs text-muted-foreground"
                >
                  Không tìm thấy phân hệ nào phù hợp với từ khóa "{filter}".
                </td>
              </tr>
            ) : (
              visibleGroups.map((group) => {
                const ResourceIcon =
                  RESOURCE_ICONS[group.resource] || Layers

                const byAction: Partial<Record<ActionKey, typeof group.permissions>> = {}
                for (const p of group.permissions) {
                  if (!byAction[p.action]) byAction[p.action] = []
                  byAction[p.action]!.push(p)
                }

                const hasExtra = Object.values(byAction).some(
                  (arr) => arr && arr.length > 1
                )

                return (
                  <Fragment key={group.resource || group.label}>
                    {/* Dòng chính phân hệ: Icon đơn giản gọn gàng + Tên + Mô tả BE */}
                    <tr className="border-b border-border/40 bg-card transition-colors hover:bg-muted/20 divide-x divide-border/60">
                      <td className="py-2.5 px-4 align-middle">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <ResourceIcon className="size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs font-semibold text-foreground">
                              {group.label}
                            </p>
                            {group.resource && (
                              <span className="font-mono text-[10px] text-muted-foreground/60">
                                ({group.resource})
                              </span>
                            )}
                          </div>
                          {group.description ? (
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground pl-6">
                              {group.description}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      {ACTIONS.map((col) => {
                        const perm = byAction[col.key]?.[0]
                        if (!perm) {
                          return (
                            <td
                              key={col.key}
                              className="p-0 text-center align-middle"
                            >
                              <span className="select-none text-xs text-muted-foreground/30">
                                —
                              </span>
                            </td>
                          )
                        }

                        return (
                          <td
                            key={col.key}
                            className="p-0 text-center align-middle"
                          >
                            <div className="flex h-11 items-center justify-center">
                              <CheckboxCell
                                checked={selectedSet.has(perm.code)}
                                disabled={disabled}
                                onChange={(chk) => toggleOne(perm.code, chk)}
                                label={perm.label}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Dòng quyền phụ: có mô tả nghiệp vụ chi tiết từ BE */}
                    {hasExtra &&
                      ACTIONS.flatMap((col) => {
                        const extras = byAction[col.key]?.slice(1) || []
                        return extras.map((perm) => (
                          <tr
                            key={perm.code}
                            className="border-b border-border/30 bg-muted/10 transition-colors hover:bg-muted/25 divide-x divide-border/60"
                          >
                            <td className="py-2 pl-8 pr-4 align-middle">
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 font-mono text-xs text-muted-foreground/50">
                                  ↳
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground">
                                    {perm.label}
                                  </p>
                                  {perm.description ? (
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                      {perm.description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            {ACTIONS.map((c) => (
                              <td
                                key={c.key}
                                className="p-0 text-center align-middle"
                              >
                                {c.key === col.key ? (
                                  <div className="flex h-9 items-center justify-center">
                                    <CheckboxCell
                                      checked={selectedSet.has(perm.code)}
                                      disabled={disabled}
                                      onChange={(chk) =>
                                        toggleOne(perm.code, chk)
                                      }
                                      label={perm.label}
                                    />
                                  </div>
                                ) : (
                                  <span className="select-none text-xs text-muted-foreground/25">
                                    —
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      })}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Checkbox xanh ngọc thanh lịch, căn giữa chuẩn xác */
function CheckboxCell({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex size-4.5 cursor-pointer items-center justify-center rounded border transition-all select-none",
        checked
          ? "border-emerald-600 bg-emerald-500 text-white font-bold shadow-2xs"
          : indeterminate
            ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold"
            : "border-input bg-card text-transparent hover:border-emerald-500/60 hover:bg-muted/40",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {checked ? (
        <Check className="size-3 stroke-[2.8]" />
      ) : indeterminate ? (
        <Minus className="size-3 stroke-[2.8]" />
      ) : null}
    </button>
  )
}
