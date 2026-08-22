import { z } from "zod"

import { FileKind, UploadType } from "@/lib/types/file.type"

/**
 * Form-state shape for one uploaded file — mirrors the backend's FileResDto in
 * full (see `FileResource`, file.type.ts). `id` is the only part that reaches
 * the backend (as `imageFileId` / `avatarFileId` / `attachmentFileIds`); the
 * rest renders the preview and attachment list.
 *
 * `url` is display-only and is never sent back — only `id` reaches the backend.
 */
export const fileFieldSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  type: z.enum(UploadType),
  kind: z.enum(FileKind),
  createdAt: z.string(),
})

export type FileFieldValue = z.infer<typeof fileFieldSchema>

/** Nullable single-image field: `null` means "no image" — and on update, "clear it". */
export const imageFieldSchema = fileFieldSchema.nullable()

export type FormMode = "create" | "update"

/** Single-file field → wire id. `undefined` omits the key (create: "no file"), explicit `null`
 *  clears it (update: PATCH treats a missing key as "no change", so clearing needs `null`). */
export function resolveApiFileId(
  file: FileFieldValue | null,
  mode: FormMode
): string | null | undefined {
  return mode === "create" ? file?.id : (file?.id ?? null)
}

/** Attachments array → wire ids — identical shape on create and update. */
export function resolveApiAttachmentFileIds(files: FileFieldValue[]): string[] {
  return files.map((file) => file.id)
}
