import { Input, Label } from "web-qlsx-start"

export const WithLabel = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="product-name">Tên sản phẩm</Label>
    <Input
      id="product-name"
      type="text"
      placeholder="VD: Trục thép C45 Ø40"
      defaultValue="Bánh răng côn xoắn M4"
    />
  </div>
)

export const Types = () => (
  <div className="grid w-full max-w-sm gap-4">
    <div className="grid gap-2">
      <Label htmlFor="order-code">Mã lệnh sản xuất</Label>
      <Input id="order-code" type="text" defaultValue="LSX-2026-0341" />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="quantity">Số lượng (chiếc)</Label>
      <Input id="quantity" type="number" defaultValue={250} min={1} />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="search-product">Tìm kiếm sản phẩm</Label>
      <Input
        id="search-product"
        type="search"
        placeholder="Nhập tên hoặc mã sản phẩm…"
      />
    </div>
  </div>
)

export const States = () => (
  <div className="grid w-full max-w-sm gap-4">
    <div className="grid gap-2">
      <Label htmlFor="placeholder-state">Ghi chú kỹ thuật</Label>
      <Input id="placeholder-state" placeholder="Chưa có ghi chú" />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="disabled-state">Người tạo lệnh</Label>
      <Input id="disabled-state" defaultValue="Nguyễn Văn Hùng" disabled />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="invalid-state">Đơn giá</Label>
      <Input id="invalid-state" defaultValue="-185.000 ₫" aria-invalid />
      <p className="text-sm text-destructive">Đơn giá phải lớn hơn 0.</p>
    </div>
  </div>
)
