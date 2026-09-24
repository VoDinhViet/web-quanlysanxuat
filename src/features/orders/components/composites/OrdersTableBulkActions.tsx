import {
  AltArrowDown,
  CloseCircle,
  DocumentText,
  File,
  FileDownload,
  Printer,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OrdersTableBulkActionsProps = {
  selectedCount: number
  allPageChecked: boolean
  currentPageCount: number
  isExportingForm?: boolean
  isPrintingForm?: boolean
  isExportingExcel?: boolean
  onSelectAllPage: () => void
  onClearSelection: () => void
  onExportForm: () => void
  onPrintForm: () => void
  onExportExcel: () => void
}

export function OrdersTableBulkActions({
  selectedCount,
  allPageChecked,
  currentPageCount,
  isExportingForm = false,
  isPrintingForm = false,
  isExportingExcel = false,
  onSelectAllPage,
  onClearSelection,
  onExportForm,
  onPrintForm,
  onExportExcel,
}: OrdersTableBulkActionsProps) {
  if (selectedCount === 0) return null

  const isExporting = isExportingForm || isPrintingForm || isExportingExcel

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in duration-150 fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 shadow-lg shadow-black/10 backdrop-blur-md">
        <span className="px-1 text-xs text-muted-foreground">
          Đã chọn{" "}
          <strong className="font-semibold text-foreground">
            {selectedCount}
          </strong>
        </span>

        {!allPageChecked && currentPageCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onSelectAllPage}
          >
            Chọn cả trang
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                size="sm"
                className="h-7 gap-1.5 rounded-full px-3 text-xs font-medium shadow-2xs"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileDownload className="size-4" />
                )}
                <span>Xuất</span>
                <AltArrowDown className="size-3 opacity-70" />
              </Button>
            }
          />
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={8}
            className="w-60 p-1.5"
          >
            <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
              Xuất {selectedCount} đơn hàng đã chọn
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              disabled={isExportingForm}
              onClick={onExportForm}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Biểu mẫu đơn hàng (BM-03/KD)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  File tài liệu PDF
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isPrintingForm}
              onClick={onPrintForm}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <Printer className="mt-0.5 size-4 shrink-0 text-sky-600" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  In biểu mẫu (BM-03/KD)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  In trực tiếp
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isExportingExcel}
              onClick={onExportExcel}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <File className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Danh sách đơn hàng
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Bảng tính Excel (.xlsx)
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={onClearSelection}
          className="ml-0.5 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Bỏ chọn"
          aria-label="Bỏ chọn tất cả"
        >
          <CloseCircle className="size-4" />
        </button>
      </div>
    </div>
  )
}
