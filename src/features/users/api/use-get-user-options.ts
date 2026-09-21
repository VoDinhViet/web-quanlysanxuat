import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { userOptionsQueryOptions } from "@/features/users/api/options"

// Server-searched options for a "Người phụ trách"/"Nhân viên kinh doanh"-style combobox — same
// idiom as clients' useGetClientOptions.ts: debounces the typed term and reads through this
// feature's own query cache, so a user write invalidates it along with the rest of `["users"]`.
// Lives here (not in the consuming feature's own hooks/) so orders can use it too without
// importing purchase-orders' hooks/ — see .claude/rules/architecture.md "Layer boundaries".
export function useGetUserOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: users = [], isFetching } = useQuery({
    ...userOptionsQueryOptions(q),
    placeholderData: keepPreviousData,
  })

  const options = users.map((user) => ({
    value: user.id,
    label: user.fullName,
  }))

  return { users, options, isFetching, onSearchChange: setQ }
}
