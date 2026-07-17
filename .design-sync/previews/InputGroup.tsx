import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "web-qlsx-start"
import { Search } from "lucide-react"

export const WithAddons = () => (
  <div className="flex w-full max-w-sm flex-col gap-4">
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Tìm sản phẩm, lệnh sản xuất…" />
    </InputGroup>
    <InputGroup>
      <InputGroupInput defaultValue="185000" inputMode="numeric" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>₫ / chiếc</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>LSX-</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput defaultValue="2026-0341" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Kiểm tra</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
)
