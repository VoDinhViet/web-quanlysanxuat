import {
  Badge,
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "web-qlsx-start"
import { Factory, Package, Wrench } from "lucide-react"

export const Single = () => (
  <Item variant="outline" className="w-full max-w-md">
    <ItemMedia variant="icon">
      <Package />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Trục cán thép D200</ItemTitle>
      <ItemDescription>Mã SP: TCT-D200 · Tồn kho: 48 chiếc</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button variant="outline" size="sm">
        Chi tiết
      </Button>
    </ItemActions>
  </Item>
)

export const List = () => (
  <ItemGroup className="w-full max-w-md rounded-lg border">
    <Item>
      <ItemMedia variant="icon">
        <Factory />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>LSX-2026-0341 — Bánh răng côn xoắn</ItemTitle>
        <ItemDescription>Xưởng A · Bắt đầu 12/07/2026</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge>Đang sản xuất</Badge>
      </ItemActions>
    </Item>
    <ItemSeparator />
    <Item>
      <ItemMedia variant="icon">
        <Wrench />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>LSX-2026-0338 — Khung băng tải</ItemTitle>
        <ItemDescription>Xưởng B · Bắt đầu 08/07/2026</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge variant="secondary">Chờ phê duyệt</Badge>
      </ItemActions>
    </Item>
  </ItemGroup>
)
