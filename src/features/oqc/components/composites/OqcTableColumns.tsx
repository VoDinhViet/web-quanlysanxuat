import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { Gallery } from "@solar-icons/react"

import type { appTableFeatures } from "@/lib/table-features"
import {
  OqcDispositionBadge,
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/primitives/OqcBadges"
import { OqcActionsCell } from "@/features/oqc/components/primitives/OqcTableCells"
import { resolveFileUrl } from "@/lib/file-url"
import type { Oqc } from "@/lib/types/oqc.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const oqcColumnHelper = createColumnHelper<typeof appTableFeatures, Oqc>()

// Trimmed from the mockup's 14 columns to what's needed to scan the list at a glance — same
// idiom as iqcColumns (IqcTableColumns.tsx): mã/tên thành phẩm collapse into one "Thành phẩm"
// column, Job/PO collapse into one, Lot size/Đvt collapse into one, "Ghi chú" dropped (still
// readable on the detail screen's OqcLotSummaryCard). "Công đoạn" stays as its own column — OQC
// is per-operation (1 thành phẩm có thể nhiều công đoạn), dropping it would make two rows for the
// same thành phẩm but different công đoạn look identical. "Mã thành phẩm"/"Tên thành phẩm" đọc từ
// `bomItem` (snapshot BOM của Job) chứ không phải `item` (không có trên response danh sách).
export const oqcColumns = oqcColumnHelper.columns([
  oqcColumnHelper.accessor("code", {
    header: "Mã OQC",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  oqcColumnHelper.display({
    id: "image",
    header: "Hình ảnh",
    meta: {
      headerClassName: "w-20 text-center font-bold text-foreground",
      cellClassName: "text-center py-2",
    },
    cell: ({ row }) => {
      const image = row.original.image
      if (!image) {
        return (
          <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            <Gallery className="size-4 text-muted-foreground/50" />
          </div>
        )
      }

      const imageUrl = resolveFileUrl(image.url)

      return (
        <div className="group mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40 transition hover:border-primary/50">
          <ZoomableImage
            src={imageUrl}
            alt={row.original.bomItem.name}
            className="transition group-hover:scale-105"
          />
        </div>
      )
    },
  }),

  oqcColumnHelper.display({
    id: "bomItem",
    header: "Thành phẩm",
    meta: { headerClassName: "min-w-48" },
    cell: ({ row }) => {
      const bomItem = row.original.bomItem

      return (
        <div className="max-w-72 min-w-0">
          <p
            className="line-clamp-2 text-xs font-semibold break-words text-foreground"
            title={bomItem.name}
          >
            {bomItem.name}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {bomItem.code}
          </p>
        </div>
      )
    },
  }),

  oqcColumnHelper.accessor((row) => row.revision ?? row.item.revision, {
    id: "revision",
    header: "Rev",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center font-mono text-xs",
    },
    cell: ({ getValue }) => getValue() || "—",
  }),

  oqcColumnHelper.accessor((row) => row.operation.name, {
    id: "operation",
    header: "Công đoạn",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <div className="max-w-40 min-w-0">
        <p className="truncate text-xs text-foreground">
          {row.original.operation.name}
        </p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {row.original.operation.code}
        </p>
      </div>
    ),
  }),

  oqcColumnHelper.display({
    id: "jobOrPo",
    header: "Job / PO",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => (
      <div className="max-w-32 min-w-0">
        <p className="truncate font-mono text-xs font-medium text-foreground">
          {row.original.productionJob.code}
        </p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {row.original.orderCode ?? "—"}
        </p>
      </div>
    ),
  }),

  oqcColumnHelper.display({
    id: "quantity",
    header: "Lot size (ĐVT)",
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {quantityFormatter.format(row.original.quantity)}{" "}
        <span className="font-normal text-muted-foreground">
          ({row.original.unit.name})
        </span>
      </span>
    ),
  }),

  oqcColumnHelper.accessor("inspectionDate", {
    header: "Ngày KT",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  oqcColumnHelper.accessor("result", {
    header: "Kết quả",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcResultBadge result={getValue()} />,
  }),

  oqcColumnHelper.accessor("disposition", {
    header: "Phương án xử lý",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const disposition = getValue()

      return disposition ? (
        <OqcDispositionBadge disposition={disposition} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )
    },
  }),

  oqcColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OqcStatusBadge status={getValue()} />,
  }),

  oqcColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <OqcActionsCell oqc={row.original} />,
  }),
])
