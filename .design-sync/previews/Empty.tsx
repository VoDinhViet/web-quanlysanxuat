import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "web-qlsx-start"
import { PackageSearch, Plus } from "lucide-react"

export const NoResults = () => (
  <Empty className="w-full max-w-md border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <PackageSearch />
      </EmptyMedia>
      <EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle>
      <EmptyDescription>
        Không có sản phẩm nào khớp với bộ lọc hiện tại. Thử xóa bộ lọc hoặc tạo
        sản phẩm mới.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <div className="flex gap-2">
        <Button variant="outline">Xóa bộ lọc</Button>
        <Button>
          <Plus />
          Thêm sản phẩm
        </Button>
      </div>
    </EmptyContent>
  </Empty>
)
