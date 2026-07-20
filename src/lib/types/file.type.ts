// Mirrors the backend's UploadType enum (be/src/database/schemas/files.ts).
// `type` is a required query param on POST /api/files and picks the MIME
// allowlist and size cap server-side. Every member here must have a matching
// backend enum value — an unknown one is rejected before Multer runs.
export const UPLOAD_TYPES = [
  "USER_AVATAR",
  "MATERIAL_IMAGE",
  "MATERIAL_DOCUMENT",
  "PRODUCT_IMAGE",
  "PRODUCT_DOCUMENT",
  "SUPPLIER_LOGO",
  "SUPPLIER_DOCUMENT",
] as const

export type UploadType = (typeof UPLOAD_TYPES)[number]

export type FileKind = "IMAGE" | "DOCUMENT"

/**
 * Mirrors the backend's FileResDto — returned by POST /api/files and embedded in
 * every entity response (`product.image`, `user.avatar`, `material.image`).
 *
 * `url` is a signed link that expires (UPLOAD_URL_TTL, 1h by default) and is
 * host-relative. Never persist or share it: render it through `resolveFileUrl`
 * (src/lib/file-url.ts) and re-read the owning entity for a fresh one.
 */
export type FileResource = {
  id: string
  url: string
  originalName: string
  mimetype: string
  size: number
  type: UploadType
  kind: FileKind
  createdAt: string
}

// Mirrors UPLOAD_POLICIES on the backend. These only save a round trip — the
// server re-checks by magic bytes, which the browser cannot replicate, so a
// rejection can still come back from the API.
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/gif": [],
}

// pdf/docx/xlsx only. Legacy binary .doc/.xls have no magic-byte signature, so
// the backend cannot tell a genuine one from a spoof and rejects both; images
// belong to FileKind.IMAGE, not DOCUMENT.
export const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
}
