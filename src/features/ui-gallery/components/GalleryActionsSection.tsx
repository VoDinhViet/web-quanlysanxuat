import { Download, Plus, Trash2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  GalleryRow,
  GallerySection,
} from "@/features/ui-gallery/components/GallerySection"

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const

const buttonSizes = ["xs", "sm", "default", "lg"] as const

const badgeVariants = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "success",
  "warning",
  "info",
  "violet",
  "neutral",
  "ghost",
  "link",
] as const

const toneVariants = [
  "success",
  "warning",
  "info",
  "violet",
  "neutral",
  "destructive",
] as const

export function GalleryActionsSection() {
  return (
    <GallerySection
      id="actions"
      title="Nút, nhãn, thông báo"
      description="Button, Badge, Alert, Spinner, Skeleton"
    >
      <GalleryRow label="Button · variant">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </GalleryRow>

      <GalleryRow label="Button · size">
        {buttonSizes.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button size="icon-sm" variant="outline" aria-label="Thêm">
          <Plus />
        </Button>
        <Button size="icon" variant="outline" aria-label="Tải xuống">
          <Download />
        </Button>
        <Button size="icon-lg" variant="outline" aria-label="Xoá">
          <Trash2 />
        </Button>
      </GalleryRow>

      <GalleryRow label="Button · trạng thái">
        <Button>
          <Plus />
          Có icon
        </Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>
          <Spinner />
          Đang lưu
        </Button>
        <Button aria-invalid>aria-invalid</Button>
      </GalleryRow>

      <GalleryRow label="Badge">
        {badgeVariants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
        <Badge variant="success">
          <span className="size-1.5 rounded-full bg-current" />
          Badge trạng thái
        </Badge>
      </GalleryRow>

      <GalleryRow label="Badge tone — soft / outline">
        {toneVariants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
        {toneVariants.map((variant) => (
          <Badge
            key={`${variant}-outline`}
            variant={variant}
            appearance="outline"
          >
            {variant}
          </Badge>
        ))}
      </GalleryRow>

      <GalleryRow label="Alert">
        <div className="flex w-full max-w-xl flex-col gap-3">
          <Alert>
            <AlertTitle>Thông tin</AlertTitle>
            <AlertDescription>
              Nội dung thông báo mặc định của hệ thống.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Có lỗi xảy ra</AlertTitle>
            <AlertDescription>
              Không thể lưu dữ liệu, vui lòng thử lại.
            </AlertDescription>
          </Alert>
        </div>
      </GalleryRow>

      <GalleryRow label="Spinner · Skeleton">
        <Spinner className="size-4" />
        <Spinner className="size-6" />
        <Spinner className="size-8" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="size-9 rounded-full" />
      </GalleryRow>
    </GallerySection>
  )
}
