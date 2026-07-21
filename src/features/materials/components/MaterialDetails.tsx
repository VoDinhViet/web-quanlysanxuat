import { useState } from "react"
import { DateTime } from "luxon"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  History,
  Info,
  Loader2,
  Paperclip,
  Plus,
  Radio,
  SlidersHorizontal,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MaterialStatusBadge,
  MaterialTypeBadge,
} from "@/features/materials/components/MaterialBadges"
import {
  materialLogsQueryOptions,
  materialQueryOptions,
} from "@/features/materials/materials.query"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { Material } from "@/features/materials/types/material.type"

const LOGS_PAGE_LIMIT = 20

const specificWeightFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 3,
})

// The backend returns the numeric column as a string ("7.850").
function formatSpecificWeight(value: string | null): string {
  if (value === null) return "—"
  const parsed = Number(value)
  return Number.isFinite(parsed) ? specificWeightFormatter.format(parsed) : "—"
}

function formatLogAction(action: string): string {
  switch (action) {
    case "CREATE":
      return "Tạo mới"
    case "UPDATE":
      return "Cập nhật"
    default:
      return action
  }
}

const TAB_TRIGGER_CLASS =
  "h-10 flex-none px-0 text-xs font-medium text-muted-foreground data-active:text-foreground"

export function MaterialDetails({
  material: row,
  trigger,
}: {
  material: Material
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // List rows omit preferredSupplier/attachments (the backend only loads those
  // relations on GET /api/materials/:id), so the full detail is fetched lazily
  // when the sheet opens; the row fills the frame until it arrives.
  const detailQuery = useQuery({
    ...materialQueryOptions(row.id),
    enabled: open,
  })
  const material = detailQuery.data ?? row
  const attachments = material.attachments ?? []

  // Fetched lazily — only once the history tab is actually opened.
  const logsQuery = useQuery({
    ...materialLogsQueryOptions(row.id, 1, LOGS_PAGE_LIMIT),
    enabled: open && activeTab === "history",
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full sm:max-w-lg"
      >
        <SheetHeader className="space-y-0 border-b border-border bg-gradient-to-b from-muted/50 to-transparent px-4 py-5">
          <SheetTitle className="sr-only">Chi tiết vật tư</SheetTitle>
          <SheetDescription className="sr-only">
            {material.code} · {material.name}
          </SheetDescription>

          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
              {material.image ? (
                <img
                  src={resolveFileUrl(material.image.url)}
                  alt={material.name}
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src="/empty-image.svg"
                  alt=""
                  className="size-full object-contain p-2.5"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              <h2 className="text-base leading-snug font-semibold text-foreground">
                {material.name}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {material.code}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <MaterialTypeBadge type={material.type} />
                <MaterialStatusBadge status={material.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full gap-0"
        >
          <div className="border-b border-border px-4 pt-4">
            <TabsList
              variant="line"
              className="h-10 w-full justify-start gap-4 overflow-x-auto rounded-none p-0"
            >
              <TabsTrigger value="info" className={TAB_TRIGGER_CLASS}>
                Thông tin chung
              </TabsTrigger>
              <TabsTrigger value="extended" className={TAB_TRIGGER_CLASS}>
                Mở rộng
              </TabsTrigger>
              <TabsTrigger value="media" className={TAB_TRIGGER_CLASS}>
                Tài liệu
              </TabsTrigger>
              <TabsTrigger value="history" className={TAB_TRIGGER_CLASS}>
                Lịch sử
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="m-0 outline-none">
            <DetailsSection title="Thông tin chung" icon={Info}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <DetailItem label="Mã vật tư" value={material.code} />
                <DetailItem label="Tên vật tư" value={material.name} />
                <DetailItem label="Đơn vị tính" value={material.unit.name} />
                <DetailItem label="Nhóm vật tư" value={material.group.name} />
                <DetailItem
                  label="Loại vật tư"
                  value={material.type === "CLIENT" ? "Khách hàng" : "Nội bộ"}
                />
                <DetailItem
                  label="Khách hàng"
                  value={material.client?.name ?? "—"}
                />
                <DetailItem
                  label="Người tạo"
                  value={material.creator?.username ?? "—"}
                />
                <DetailItem
                  label="Cập nhật"
                  value={DateTime.fromISO(material.updatedAt).toFormat(
                    "dd/MM/yyyy"
                  )}
                />
              </div>
              <DetailItem
                className="mt-4"
                label="Ghi chú"
                value={material.note ?? "—"}
              />
            </DetailsSection>
          </TabsContent>

          <TabsContent value="extended" className="m-0 outline-none">
            <DetailsSection title="Thông tin mở rộng" icon={SlidersHorizontal}>
              <DetailLoading pending={detailQuery.isLoading}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <DetailItem
                    label="Vật liệu / Mác thép"
                    value={material.materialGrade ?? "—"}
                  />
                  <DetailItem
                    label="Tiêu chuẩn kỹ thuật"
                    value={material.technicalStandard ?? "—"}
                  />
                  <DetailItem
                    label="Kích thước / Độ dày"
                    value={material.dimensions ?? "—"}
                  />
                  <DetailItem
                    label="Trọng lượng riêng"
                    value={formatSpecificWeight(material.specificWeight)}
                  />
                  <DetailItem
                    label="Màu sắc / Bề mặt"
                    value={material.colorSurface ?? "—"}
                  />
                  <DetailItem label="Xuất xứ" value={material.origin ?? "—"} />
                  <DetailItem
                    label="Nhà cung cấp ưu tiên"
                    value={material.preferredSupplier?.name ?? "—"}
                  />
                  <DetailItem
                    label="Thời gian giao hàng"
                    value={material.leadTime ?? "—"}
                  />
                </div>
                <DetailItem
                  className="mt-4"
                  label="Mô tả chi tiết"
                  value={material.description ?? "—"}
                />
              </DetailLoading>
            </DetailsSection>
          </TabsContent>

          <TabsContent value="media" className="m-0 outline-none">
            <DetailsSection title="Hình ảnh & Tài liệu" icon={Paperclip}>
              <DetailLoading pending={detailQuery.isLoading}>
                {attachments.length === 0 ? (
                  <EmptyHint icon={Paperclip}>
                    Chưa có tài liệu đính kèm.
                  </EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <a
                          href={resolveFileUrl(attachment.file.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </span>
                          <span className="truncate text-xs font-medium text-foreground">
                            {attachment.file.originalName}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </DetailLoading>
            </DetailsSection>
          </TabsContent>

          <TabsContent value="history" className="m-0 outline-none">
            <DetailsSection title="Lịch sử thay đổi" icon={History}>
              {logsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải...
                </div>
              ) : logsQuery.isError ? (
                <p className="text-xs font-medium text-destructive">
                  {logsQuery.error.message}
                </p>
              ) : logsQuery.data && logsQuery.data.data.length > 0 ? (
                <ol className="relative space-y-5 border-l border-border/70 pl-5">
                  {logsQuery.data.data.map((log) => {
                    const isCreate = log.action === "CREATE"

                    return (
                      <li key={log.id} className="relative">
                        <span
                          className={cn(
                            "absolute top-0.5 -left-[1.6rem] flex size-6 items-center justify-center rounded-full ring-4 ring-card",
                            isCreate
                              ? "bg-success/15 text-success"
                              : "bg-info/15 text-info"
                          )}
                        >
                          {isCreate ? (
                            <Plus className="size-3" />
                          ) : (
                            <Radio className="size-3" />
                          )}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {formatLogAction(log.action)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {DateTime.fromISO(log.createdAt).toFormat(
                              "dd/MM/yyyy HH:mm"
                            )}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {log.changer?.username ?? "Hệ thống"}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <EmptyHint icon={History}>Chưa có lịch sử thay đổi.</EmptyHint>
              )}
            </DetailsSection>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function DetailsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section className="px-4 py-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-xs font-medium break-words text-foreground">{value}</p>
    </div>
  )
}

function DetailLoading({
  pending,
  children,
}: {
  pending: boolean
  children: ReactNode
}) {
  if (pending) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải...
      </div>
    )
  }

  return <>{children}</>
}

function EmptyHint({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Icon className="size-6 text-muted-foreground/50" />
      <p className="text-xs font-medium text-muted-foreground">{children}</p>
    </div>
  )
}
