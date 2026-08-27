// Mirrors the backend's UploadType enum (be/src/database/schemas/files.ts).
// `type` is a required query param on POST /api/files and picks the MIME
// allowlist and size cap server-side. Every member here must have a matching
// backend enum value — an unknown one is rejected before Multer runs.
export enum UploadType {
  USER_AVATAR = "USER_AVATAR",
  MATERIAL_IMAGE = "MATERIAL_IMAGE",
  MATERIAL_DOCUMENT = "MATERIAL_DOCUMENT",
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  // Retired 2026-08-27 — thay bằng ITEM_DOCUMENT. Bị bỏ nhầm khi gộp products/materials thành
  // items, tưởng bản vẽ theo node BOM thay thế được (không đúng — BUG-007). Kept because the
  // backend enum can't drop a value either; don't use for new files.
  PRODUCT_DOCUMENT = "PRODUCT_DOCUMENT",
  SUPPLIER_LOGO = "SUPPLIER_LOGO",
  SUPPLIER_DOCUMENT = "SUPPLIER_DOCUMENT",
  BOM_ITEM_DRAWING = "BOM_ITEM_DRAWING",
  ORDER_DOCUMENT = "ORDER_DOCUMENT",
  IQC_EVIDENCE = "IQC_EVIDENCE",
  IQC_DISPOSITION_EVIDENCE = "IQC_DISPOSITION_EVIDENCE",
  OQC_EVIDENCE = "OQC_EVIDENCE",
  OQC_DISPOSITION_EVIDENCE = "OQC_DISPOSITION_EVIDENCE",
  // Ảnh đính kèm khi báo cáo hoàn thành một công đoạn — màn "Thực hiện sản xuất"
  // (POST /production-execution/operations/:jobOperationId/reports).
  PRODUCTION_OPERATION_EVIDENCE = "PRODUCTION_OPERATION_EVIDENCE",
  // File đính kèm khi kho xác nhận xuất trả NCC (POST /supplier-returns/:id/post).
  SUPPLIER_RETURN_EVIDENCE = "SUPPLIER_RETURN_EVIDENCE",
  // Tài liệu đính kèm cấp item — mọi type (FG/WIP/RM), danh sách nhiều file, khác
  // BOM_ITEM_DRAWING (tối đa 1 file, gắn theo từng node BOM). Thay PRODUCT_DOCUMENT đã nghỉ hưu.
  ITEM_DOCUMENT = "ITEM_DOCUMENT",
}

export enum FileKind {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  // Ảnh ∪ tài liệu — bằng chứng IQC vừa có ảnh chụp thực tế vừa có tài liệu đo lường (PDF).
  EVIDENCE = "EVIDENCE",
}

/**
 * Mirrors the backend's FileResDto — returned by POST /api/files and embedded in
 * every entity response (`product.image`, `user.avatar`, `material.image`).
 *
 * `url` is a public, permanent, host-relative static link — render it through
 * `resolveFileUrl` (src/lib/file-url.ts) to get an absolute one.
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

// IQC/OQC evidence — union of IMAGE and DOCUMENT, matching the backend's FileKind.EVIDENCE.
export const ACCEPTED_EVIDENCE_TYPES = {
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
}
