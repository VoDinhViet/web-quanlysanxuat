import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "web-qlsx-start"

export const ProductSummary = () => (
  <Card className="w-96">
    <CardHeader>
      <CardTitle>Trục thép C45 Ø40</CardTitle>
      <CardDescription>Mã sản phẩm: SP-2024-0158 · Nhóm: Trục cơ khí</CardDescription>
      <CardAction>
        <Badge>Đang sản xuất</Badge>
      </CardAction>
    </CardHeader>
    <CardContent>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Tồn kho</dt>
        <dd className="text-right font-medium">1.250 chiếc</dd>
        <dt className="text-muted-foreground">Đơn giá</dt>
        <dd className="text-right font-medium">185.000 ₫</dd>
        <dt className="text-muted-foreground">Ngày cập nhật</dt>
        <dd className="text-right font-medium">12/07/2026</dd>
      </dl>
    </CardContent>
    <CardFooter className="justify-end gap-2">
      <Button variant="outline" size="sm">
        Lịch sử
      </Button>
      <Button size="sm">Xem chi tiết</Button>
    </CardFooter>
  </Card>
)

export const SimpleStat = () => (
  <div className="flex gap-4">
    <Card className="w-56">
      <CardHeader>
        <CardDescription>Lệnh sản xuất trong tháng</CardDescription>
        <CardTitle className="text-3xl">128</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
      </CardContent>
    </Card>
    <Card className="w-56">
      <CardHeader>
        <CardDescription>Sản phẩm chờ QC</CardDescription>
        <CardTitle className="text-3xl">37</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">8 lô cần xử lý gấp</p>
      </CardContent>
    </Card>
  </div>
)
