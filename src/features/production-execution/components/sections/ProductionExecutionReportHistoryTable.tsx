import { useState } from "react"
import { DateTime } from "luxon"
import { History, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductionExecutionReport } from "@/lib/types/production-job.type"

type PartOption = {
  id: string
  code: string
  name: string
}

type ProductionExecutionReportHistoryTableProps = {
  reports: ProductionExecutionReport[]
  isPending: boolean
  isError: boolean
  error?: string
  onRetry?: () => void
  partOptions: PartOption[]
  selectedBomItemId: string | null
  onSelectBomItemId: (bomItemId: string | null) => void
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

export function ProductionExecutionReportHistoryTable({
  reports,
  isPending,
  isError,
  error,
  onRetry,
  partOptions,
  selectedBomItemId,
  onSelectBomItemId,
}: ProductionExecutionReportHistoryTableProps) {
  const [activeImage, setActiveImage] = useState<{
    src: string
    alt: string
  } | null>(null)

  const filteredReports = selectedBomItemId
    ? reports.filter((r) => r.bomItemId === selectedBomItemId)
    : reports

  if (isPending) {
    return <TableQueryLoading rows={5} />
  }

  if (isError) {
    return (
      <TableQueryError
        error={error ?? "Không thể tải lịch sử báo cáo."}
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Lọc theo Part:
          </span>
          <Select
            value={selectedBomItemId ?? "ALL"}
            onValueChange={(val) => onSelectBomItemId(val === "ALL" ? null : val)}
          >
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue placeholder="Tất cả Part" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                Tất cả Part ({reports.length})
              </SelectItem>
              {partOptions.map((part) => (
                <SelectItem key={part.id} value={part.id} className="text-xs">
                  <span className="font-mono font-medium">{part.code}</span> —{" "}
                  {part.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Tổng số lượt báo cáo:</span>
          <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
            {filteredReports.length}
          </Badge>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <TableEmpty
          icon={History}
          title="Chưa có báo cáo nào"
          description={
            selectedBomItemId
              ? "Part này chưa có lần báo cáo sản lượng nào."
              : "Công đoạn này chưa có lần báo cáo sản lượng nào được ghi nhận."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table aria-label="Lịch sử báo cáo sản lượng">
            <TableHeader className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45">
              <TableRow>
                <TableHead className="min-w-36 text-xs">Thời gian</TableHead>
                <TableHead className="min-w-36 text-xs">Người báo cáo</TableHead>
                <TableHead className="min-w-44 text-xs">Part / Chi tiết</TableHead>
                <TableHead className="min-w-28 text-center text-xs">
                  SL Đạt
                </TableHead>
                <TableHead className="min-w-28 text-center text-xs">
                  SL Không đạt
                </TableHead>
                <TableHead className="min-w-48 text-xs">Ghi chú</TableHead>
                <TableHead className="min-w-32 text-center text-xs">
                  Ảnh minh chứng
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {filteredReports.map((report) => {
                const formattedCompletedDate = report.completedDate
                  ? DateTime.fromISO(report.completedDate).toFormat("dd/MM/yyyy")
                  : "—"
                const formattedCreatedAt = report.createdAt
                  ? DateTime.fromISO(report.createdAt).toFormat(
                      "HH:mm, dd/MM/yyyy"
                    )
                  : ""

                return (
                  <TableRow
                    key={report.id}
                    className="h-14 hover:bg-muted/25 transition-colors"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-xs">
                          {formattedCompletedDate}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formattedCreatedAt}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      {report.creator ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            <User className="size-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-xs font-medium text-foreground">
                              {report.creator.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {report.creator.code}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Hệ thống</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-medium text-foreground">
                          {report.bomItemName}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {report.bomItemCode}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 px-2 py-1 font-mono text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        +{quantityFormatter.format(report.completedQuantityDelta)} pcs
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      {report.rejectedQuantityDelta > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-md bg-rose-50 px-2 py-1 font-mono text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                          +{quantityFormatter.format(report.rejectedQuantityDelta)} pcs
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5">
                      {report.note ? (
                        <p className="line-clamp-2 text-xs text-foreground/85">
                          {report.note}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 text-center">
                      {report.files.length > 0 ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {report.files.map((file, idx) => {
                            const fileUrl = resolveFileUrl(file.url)
                            return (
                              <button
                                key={file.id}
                                type="button"
                                className="group relative size-9 overflow-hidden rounded-md border border-border/70 bg-muted/30 transition-transform hover:scale-105"
                                onClick={() =>
                                  setActiveImage({
                                    src: fileUrl,
                                    alt:
                                      file.originalName ||
                                      `Ảnh minh chứng ${idx + 1}`,
                                  })
                                }
                                title={
                                  file.originalName || "Bấm để xem ảnh lớn"
                                }
                              >
                                <img
                                  src={fileUrl}
                                  alt={file.originalName || "Minh chứng"}
                                  className="size-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {activeImage && (
        <ImageLightbox
          src={activeImage.src}
          alt={activeImage.alt}
          open={!!activeImage}
          onOpenChange={(open) => {
            if (!open) setActiveImage(null)
          }}
        />
      )}
    </div>
  )
}
