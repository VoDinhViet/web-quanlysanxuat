import { useMemo, useState } from "react"
import {
  CheckCircle,
  DangerCircle,
  Import,
  ListCheck,
} from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { ImportDirectsRowDialog } from "@/features/directs/components/composites/ImportDirectsRowDialog"
import { ImportDirectsPreviewTable } from "@/features/directs/components/composites/ImportDirectsPreviewTable"
import { hasRowErrors } from "@/features/directs/constants/import-direct-rows"
import { directImportFields } from "@/lib/types/direct.type"
import type { DirectImportPreviewRow } from "@/lib/types/direct.type"
import { cn } from "@/lib/utils"

type ImportDirectsPreviewCardProps = {
  rows: DirectImportPreviewRow[]
  isPending: boolean
  onRowSave: (
    rowNumber: number,
    values: DirectImportPreviewRow["values"]
  ) => void
  onDeleteRow: (rowNumber: number) => void
  onCancel: () => void
  onSubmit: () => void
}

export function ImportDirectsPreviewCard({
  rows,
  isPending,
  onRowSave,
  onDeleteRow,
  onCancel,
  onSubmit,
}: ImportDirectsPreviewCardProps) {
  const [onlyInvalid, setOnlyInvalid] = useState(false)
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null)
  const editingRow =
    rows.find((row) => row.rowNumber === editingRowNumber) ?? null
  const invalidRows = useMemo(() => rows.filter(hasRowErrors), [rows])
  const invalidCount = invalidRows.length
  const visibleRows = onlyInvalid ? invalidRows : rows

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <ListCheck className="mt-0.5 size-5 text-primary" />
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
              Xem trước dữ liệu
            </h2>
            <p className="text-xs text-muted-foreground">
              Kiểm tra từng dòng, sửa trực tiếp trên ô hoặc xoá dòng lỗi trước
              khi nhập.
            </p>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium">{rows.length} dòng</span>
            <span className="flex items-center gap-1 text-success">
              <CheckCircle className="size-4" />
              {rows.length - invalidCount} hợp lệ
            </span>
            {invalidCount > 0 && (
              <>
                <span className="flex items-center gap-1 text-destructive">
                  <DangerCircle className="size-4" />
                  {invalidCount} dòng lỗi
                </span>
                <Label className="gap-2 text-xs font-normal">
                  <Checkbox
                    checked={onlyInvalid}
                    onCheckedChange={(checked) =>
                      setOnlyInvalid(checked === true)
                    }
                  />
                  Chỉ hiện dòng lỗi
                </Label>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {rows.length > 0 ? (
          <ImportDirectsPreviewTable
            rows={visibleRows}
            disabled={isPending}
            onEdit={setEditingRowNumber}
            onDelete={onDeleteRow}
          />
        ) : (
          <PreviewEmpty />
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            disabled={rows.length === 0 || invalidCount > 0 || isPending}
            onClick={onSubmit}
          >
            {isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Import className="size-4" />
            )}
            {isPending ? "Đang nhập..." : `Nhập ${rows.length} vật tư`}
          </Button>
        </div>
      </div>

      <ImportDirectsRowDialog
        row={editingRow}
        onClose={() => setEditingRowNumber(null)}
        onSave={(rowNumber, values) => {
          onRowSave(rowNumber, values)
          setEditingRowNumber(null)
        }}
      />
    </section>
  )
}

function PreviewEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/30 px-4 py-8 text-center">
      <ListCheck className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Chưa có dữ liệu để xem trước</p>
        <p className="text-xs text-muted-foreground">
          Chọn file Excel ở trên, dữ liệu sẽ hiện tại đây để bạn kiểm tra và
          sửa.
        </p>
      </div>
      <div className="flex max-w-2xl flex-wrap justify-center gap-1.5">
        {directImportFields.map((field) => (
          <span
            key={field.key}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px]",
              field.required
                ? "border-primary/30 bg-primary/10 font-medium text-primary"
                : "text-muted-foreground"
            )}
          >
            {field.label}
            {field.required && " *"}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        <span className="font-medium text-primary">*</span> là cột bắt buộc
      </p>
    </div>
  )
}
