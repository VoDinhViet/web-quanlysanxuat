import { useState } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useGetUserOptions } from "@/features/users/api"
import type { UserRef } from "@/lib/types/user.type"

type UserComboboxProps = {
  selectedUserId?: string
  onSelectUser: (userId?: string) => void
  disabled?: boolean
}

export function UserCombobox({
  selectedUserId,
  onSelectUser,
  disabled,
}: UserComboboxProps) {
  const { users, isFetching, onSearchChange } = useGetUserOptions()
  const [selected, setSelected] = useState<UserRef | null>(null)

  // `selectedUserId` có thể được đặt từ ngoài (mặc định theo người đăng nhập, nháp khôi phục) khi
  // chưa chọn gì trong phiên này — lúc đó lấy tên từ danh sách.
  const selectedUser = selectedUserId
    ? ([selected, ...users].find((user) => user?.id === selectedUserId) ?? null)
    : null

  return (
    <div>
      <Combobox
        items={users}
        value={selectedUser}
        onValueChange={(user) => {
          setSelected(user)
          onSelectUser(user?.id)
        }}
        onInputValueChange={onSearchChange}
        itemToStringLabel={(user) => user.fullName}
        isItemEqualToValue={(user, current) => user.id === current.id}
      >
        <ComboboxInput
          id="user-combobox"
          placeholder="Tìm nhân viên..."
          disabled={disabled}
          showClear={Boolean(selectedUserId) && !disabled}
          className="w-full"
        />

        <ComboboxContent>
          <ComboboxEmpty>
            {isFetching ? "Đang tìm..." : "Không tìm thấy nhân viên"}
          </ComboboxEmpty>

          <ComboboxList>
            {users.map((user) => (
              <ComboboxItem key={user.id} value={user}>
                {user.fullName}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
