import { Button, Spinner } from "web-qlsx-start"

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <Spinner />
    <Spinner className="size-6" />
    <Spinner className="size-8" />
  </div>
)

export const InContext = () => (
  <div className="flex flex-col items-start gap-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Đang tải danh sách lệnh sản xuất…
    </div>
    <Button disabled>
      <Spinner />
      Đang lưu…
    </Button>
  </div>
)
