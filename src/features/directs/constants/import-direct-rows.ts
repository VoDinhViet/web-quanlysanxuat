import { importDirectRowSchema } from "@/features/directs/schemas/import-direct-row.schema"
import { directImportFields } from "@/lib/types/direct.type"
import type {
  DirectImportCellErrors,
  DirectImportKey,
  DirectImportPreviewRow,
} from "@/lib/types/direct.type"

function isImportKey(key: PropertyKey): key is DirectImportKey {
  return directImportFields.some((field) => field.key === key)
}

export function getRowErrors(
  row: DirectImportPreviewRow
): DirectImportCellErrors {
  const errors: DirectImportCellErrors = {}
  const result = importDirectRowSchema.safeParse(row.values)

  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (isImportKey(key)) {
        errors[key] ??= issue.message
      }
    }
  }

  return errors
}

export function hasRowErrors(row: DirectImportPreviewRow): boolean {
  return Object.keys(getRowErrors(row)).length > 0
}
