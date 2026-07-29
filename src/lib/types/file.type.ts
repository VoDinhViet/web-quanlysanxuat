// Mirrors the backend's UploadType enum (be/src/database/schemas/files.ts).
// `type` is a required query param on POST /api/files and picks the MIME
// allowlist and size cap server-side. Every member here must have a matching
// backend enum value — an unknown one is rejected before Multer runs.
export enum UploadType {
  USER_AVATAR = "USER_AVATAR",
  MATERIAL_IMAGE = "MATERIAL_IMAGE",
  MATERIAL_DOCUMENT = "MATERIAL_DOCUMENT",
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  PRODUCT_DOCUMENT = "PRODUCT_DOCUMENT",
  SUPPLIER_LOGO = "SUPPLIER_LOGO",
  SUPPLIER_DOCUMENT = "SUPPLIER_DOCUMENT",
  BOM_ITEM_DRAWING = "BOM_ITEM_DRAWING",
  ORDER_DOCUMENT = "ORDER_DOCUMENT",
}

export enum FileKind {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
}

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

// BOM_ITEM_DRAWING shares the backend's DOCUMENT policy (pdf/docx/xlsx allowed server-side), but
// a bản vẽ is narrowed to PDF-only client-side — same pattern as ProductImageField narrowing the
// shared IMAGE policy.
export const ACCEPTED_DRAWING_TYPES = {
  "application/pdf": [],
}
