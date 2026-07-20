import { z } from "zod"

/**
 * Form-state shape for one uploaded file. `id` is the only part that reaches the
 * backend (as `imageFileId` / `avatarFileId` / `attachmentFileIds`); `url` feeds
 * the preview and `originalName` the attachment list.
 *
 * The URL expires after about an hour, so it is display-only and is never sent
 * back. That means a restored draft can show a broken preview while still
 * submitting correctly — the id does not expire.
 */
export const fileFieldSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  originalName: z.string(),
})

export type FileFieldValue = z.infer<typeof fileFieldSchema>

/** Single-image picker: `null` means "no image" — and on PATCH, "clear it". */
export const imageFieldSchema = fileFieldSchema.nullable()
