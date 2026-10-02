import {
  CheckCircle,
  DangerCircle,
  DownloadMinimalistic,
  FileText,
  InfoCircle,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type GuideItem = {
  icon: ComponentType<IconProps>
  iconClassName: string
  title: string
  description: string
}

const guideItems: GuideItem[] = [
  {
    icon: FileText,
    iconClassName: "text-success",
    title: "Điền theo file mẫu",
    description: "Giữ nguyên dòng tiêu đề, mỗi vật tư một dòng.",
  },
  {
    icon: DangerCircle,
    iconClassName: "text-warning",
    title: "Sửa lỗi ngay trên trang",
    description:
      "Ô lỗi được tô đỏ, bạn có thể sửa hoặc xoá dòng trước khi nhập.",
  },
  {
    icon: CheckCircle,
    iconClassName: "text-primary",
    title: "Nhập khi hết lỗi",
    description: "Hệ thống chỉ nhập khi tất cả dòng đều hợp lệ.",
  },
]

type ImportDirectsGuideCardProps = {
  isTemplatePending: boolean
  onDownloadTemplate: () => void
}

export function ImportDirectsGuideCard({
  isTemplatePending,
  onDownloadTemplate,
}: ImportDirectsGuideCardProps) {
  return (
    <aside className="border-border/60 xl:border-l">
      <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <InfoCircle className="mt-0.5 size-5 text-info" />
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Hướng dẫn nhanh
          </h2>
          <p className="text-xs text-muted-foreground">
            Làm theo các gợi ý sau để nhập nhanh và không lỗi.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <FileText className="size-8 shrink-0 text-success" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">File Excel mẫu</p>
            <p className="text-xs text-muted-foreground">
              Có sẵn đủ cột và một dòng ví dụ.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            disabled={isTemplatePending}
            onClick={onDownloadTemplate}
          >
            {isTemplatePending ? (
              <Spinner className="size-3.5" />
            ) : (
              <DownloadMinimalistic className="size-3.5" />
            )}
            {isTemplatePending ? "Đang tải..." : "Tải về"}
          </Button>
        </div>

        <ul className="flex flex-col gap-4">
          {guideItems.map(
            ({ icon: Icon, iconClassName, title, description }) => (
              <li key={title} className="flex gap-3">
                <Icon className={cn("mt-0.5 size-5 shrink-0", iconClassName)} />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </aside>
  )
}
