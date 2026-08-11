import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { userOptionsQueryOptions } from "@/features/users/api"

// Server-searched options for the "Người phụ trách" combobox — same idiom as
// useGetClientOptions.ts: debounces the typed term and reads through users' own `api/index.ts`
// barrel (Layer boundaries), so a user write invalidates it along with the rest of `["users"]`.
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
