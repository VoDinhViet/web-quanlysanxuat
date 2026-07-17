import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "web-qlsx-start"

const ORDERS = [
  {
    code: "LSX-2026-0341",
    product: "Trục thép C45 Ø40",
    qty: "500",
    status: "Đang sản xuất",
    tone: "default",
  },
  {
    code: "LSX-2026-0342",
    product: "Bánh răng côn xoắn M4",
    qty: "120",
    status: "Chờ vật tư",
    tone: "secondary",
  },
  {
    code: "LSX-2026-0339",
    product: "Mặt bích DN100",
    qty: "300",
    status: "Hoàn thành",
    tone: "outline",
  },
  {
    code: "LSX-2026-0337",
    product: "Khớp nối trục Ø55",
    qty: "80",
    status: "Tạm dừng",
    tone: "destructive",
  },
] as const

export const ProductionOrders = () => (
  <Table className="w-[640px]">
    <TableCaption>Danh sách lệnh sản xuất — tháng 07/2026</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Mã lệnh</TableHead>
        <TableHead>Sản phẩm</TableHead>
        <TableHead className="text-right">Số lượng</TableHead>
        <TableHead>Trạng thái</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {ORDERS.map((o) => (
        <TableRow key={o.code}>
          <TableCell className="font-medium">{o.code}</TableCell>
          <TableCell>{o.product}</TableCell>
          <TableCell className="text-right">{o.qty}</TableCell>
          <TableCell>
            <Badge variant={o.tone}>{o.status}</Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={2}>Tổng số lượng</TableCell>
        <TableCell className="text-right">1.000</TableCell>
        <TableCell />
      </TableRow>
    </TableFooter>
  </Table>
)
