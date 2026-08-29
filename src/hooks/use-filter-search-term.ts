import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import type { KeyboardEvent } from "react"

type UseFilterSearchTermOptions = {
  initialValue: string
  onSearch: (term: string) => void
  delay?: number
}

// The debounce-as-you-type + Enter-to-flush plumbing every table filter's search field repeats.
// `onSearch` stays the caller's own concern — it writes to that route's own search params
// (`q`, `page`, ...), which the hook has no business knowing the shape of. See
// InventoryRequisitionsTableFilter.tsx for a call site.
export function useFilterSearchTerm({
  initialValue,
  onSearch,
  delay = 300,
}: UseFilterSearchTermOptions) {
  const [value, setValue] = useState(initialValue)
  const debouncedSearch = useDebounceCallback(onSearch, delay)

  return {
    value,
    onChange: (next: string) => {
      setValue(next)
      debouncedSearch(next)
    },
    onEnterKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        debouncedSearch.flush()
      }
    },
    reset: () => {
      debouncedSearch.cancel()
      setValue("")
    },
  }
}
