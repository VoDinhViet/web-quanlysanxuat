import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { FileFieldValue } from "@/lib/file-field.schema"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// Mirrors the backend's `DraftFilesReqDto` cap.
const MAX_DRAFT_FILES = 500

const draftFilesSchema = z.object({
  fileIds: z.array(z.uuid()).max(MAX_DRAFT_FILES),
})

export type HoldDraftFilesResult = {
  /** When the held files (and the draft that owns them) expire, from this save. */
  expiresAt: string
  /** Files the server no longer has (already swept); the form must drop them. */
  missingFileIds: string[]
}

/**
 * Keeps the uploaded files of a saved form draft from the backend's orphan sweep, which deletes a
 * file nobody has linked after 24 hours. Both endpoints only touch the caller's own uploads.
 */
export const holdDraftFiles = createServerFn({ method: "POST" })
  .validator(draftFilesSchema)
  .handler(async ({ data }): Promise<HoldDraftFilesResult> => {
    try {
      const response = await http.post<HoldDraftFilesResult>(
        "/api/files/drafts/hold",
        { fileIds: data.fileIds }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "holdDraftFiles")

      throw new Error(GENERIC_ERROR_MESSAGE)
    }
  })

/** Lets the sweep delete the files of a draft that was cleared, or files removed from a draft. */
export const releaseDraftFiles = createServerFn({ method: "POST" })
  .validator(draftFilesSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/files/drafts/release", { fileIds: data.fileIds })
    } catch (error) {
      logHttpError(error, "releaseDraftFiles")

      throw new Error(GENERIC_ERROR_MESSAGE)
    }
  })

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const prototype: unknown = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

function visitFiles(
  node: unknown,
  onFile: (file: FileFieldValue) => void
): void {
  const parsedFile = fileFieldSchema.safeParse(node)

  if (parsedFile.success) {
    onFile(parsedFile.data)
  } else if (Array.isArray(node)) {
    node.forEach((child) => visitFiles(child, onFile))
  } else if (isPlainObject(node)) {
    Object.values(node).forEach((child) => visitFiles(child, onFile))
  }
}

/** Ids of every uploaded file anywhere in a form's values, without repeats. */
export function collectDraftFileIds(values: unknown): string[] {
  const fileIds = new Set<string>()

  visitFiles(values, (file) => fileIds.add(file.id))

  return [...fileIds]
}

const REMOVED = Symbol("removed-draft-file")

function stripFiles(
  node: unknown,
  removedFileIds: ReadonlySet<string>
): unknown {
  const parsedFile = fileFieldSchema.safeParse(node)

  if (parsedFile.success) {
    return removedFileIds.has(parsedFile.data.id) ? REMOVED : node
  }

  if (Array.isArray(node)) {
    return node
      .map((child) => stripFiles(child, removedFileIds))
      .filter((child) => child !== REMOVED)
  }

  if (isPlainObject(node)) {
    return Object.fromEntries(
      Object.entries(node).map(([fieldName, fieldValue]) => {
        const stripped = stripFiles(fieldValue, removedFileIds)

        // A single-file field (image, logo, avatar) is nullable; an array just loses the item.
        return [fieldName, stripped === REMOVED ? null : stripped]
      })
    )
  }

  return node
}

/** Copy of the form values without the given files: out of arrays, `null` in single-file fields. */
export function removeDraftFiles<TValues>(
  values: TValues,
  fileIds: readonly string[]
): TValues {
  // The tree is only rebuilt, never reshaped, so it still matches TValues.
  return stripFiles(values, new Set(fileIds)) as TValues
}
