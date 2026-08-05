import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { operationOptionsQueryOptions } from "@/features/operations/api/options"
import type { OperationType } from "@/lib/types/operation.type"
import { buildSelectOptions } from "@/lib/utils"

// Server-searched options for the "add step" combobox: debounces the typed
// term and reads operationOptionsQueryOptions (GET /api/operations?q=...)
// from the shared query cache, optionally narrowed to one Inhouse/Outsource
// `type`. `select` maps each master operation ref (OperationRef) to the
// {value, label} pairs ComboboxField expects; `onSearchChange` is the
// debounced setter.
export function useGetOperationOptions(type?: OperationType) {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...operationOptionsQueryOptions(q, type),
    select: (operations) => buildSelectOptions(operations),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
