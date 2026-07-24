import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { operationOptionsQueryOptions } from "@/features/products/queries/operation-options.query"
import type { OperationType } from "@/features/products/types/operation.type"

// Server-searched options for the "add step" combobox: debounces the typed
// term and reads operationOptionsQueryOptions (GET /api/operations?q=...)
// from the shared query cache, optionally narrowed to one Inhouse/Outsource
// `type`. `select` maps the raw {id,name} rows to the {value,label} pairs
// ComboboxField expects; `onSearchChange` is the debounced setter.
export function useGetOperationOptions(type?: OperationType) {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...operationOptionsQueryOptions(q, type),
    select: (operations) =>
      operations.map((operation) => ({
        value: operation.id,
        label: operation.name,
      })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
