import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { operationOptionsQueryOptions } from "@/features/operations/api/options"
import type { OperationRef, OperationType } from "@/lib/types/operation.type"
import { buildSelectOptions } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

type OperationPickerData = {
  options: SelectOption[]
  typeByOperationId: Map<string, OperationType>
}

function toOperationPickerData(
  operations: OperationRef[]
): OperationPickerData {
  return {
    options: buildSelectOptions(operations),
    typeByOperationId: new Map(
      operations.map((operation) => [operation.id, operation.type])
    ),
  }
}

// Server-searched options for the "add step" combobox: debounces the typed
// term and reads operationOptionsQueryOptions (GET /api/operations/options?q=...)
// from the shared query cache. `select` maps each master operation ref
// (OperationRef) to the {value, label} pairs ComboboxField expects, plus the
// catalog type of each so a picker can pre-fill it; `onSearchChange` is the
// debounced setter.
export function useGetOperationOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data, isFetching } = useQuery({
    ...operationOptionsQueryOptions(q),
    select: toOperationPickerData,
    placeholderData: keepPreviousData,
  })

  return {
    options: data?.options ?? [],
    typeByOperationId: data?.typeByOperationId,
    isFetching,
    onSearchChange: setQ,
  }
}
