import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "web-qlsx-start"
import { ClipboardList, Package, Plus, Users } from "lucide-react"

export const Palette = () => (
  <Command className="w-full max-w-md rounded-lg border shadow-md">
    <CommandInput placeholder="Nhập lệnh hoặc tìm kiếm…" />
    <CommandList>
      <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
      <CommandGroup heading="Điều hướng">
        <CommandItem>
          <ClipboardList />
          Lệnh sản xuất
        </CommandItem>
        <CommandItem>
          <Package />
          Sản phẩm
        </CommandItem>
        <CommandItem>
          <Users />
          Người dùng
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Thao tác">
        <CommandItem>
          <Plus />
          Tạo lệnh sản xuất mới
          <CommandShortcut>Ctrl+N</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
)
