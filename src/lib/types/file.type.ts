// Mirrors the backend's UploadType enum (be/src/database/schemas/files.ts).
// `type` is a required query param on POST /api/files and picks the MIME
// allowlist and size cap server-side. Every member here must have a matching
// backend enum value — an unknown one is rejected before Multer runs.
export enum UploadType {
  USER_AVATAR = "USER_AVATAR",
  CONSUMABLE_IMAGE = "CONSUMABLE_IMAGE",
  CONSUMABLE_DOCUMENT = "CONSUMABLE_DOCUMENT",
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  // Retired 2026-08-27 — thay bằng ITEM_DOCUMENT. Bị bỏ nhầm khi gộp products/consumables thành
  // items, tưởng bản vẽ theo node BOM thay thế được (không đúng — BUG-007). Kept because the
  // backend enum can't drop a value either; don't use for new files.
  PRODUCT_DOCUMENT = "PRODUCT_DOCUMENT",
  SUPPLIER_LOGO = "SUPPLIER_LOGO",
  SUPPLIER_DOCUMENT = "SUPPLIER_DOCUMENT",
  // Retired 2026-09-17 — cột bom_items.drawing_file_id đã bỏ phía backend; không dùng cho file mới.
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
  // Tài liệu đính kèm cấp item — mọi type (FG/CONSUMABLE), danh sách nhiều file. Thay
  // PRODUCT_DOCUMENT đã nghỉ hưu.
  ITEM_DOCUMENT = "ITEM_DOCUMENT",
  // Ảnh riêng của một node BOM COMPONENT (bom_items.image_file_id, tối đa 1) — khác PRODUCT_IMAGE
  // là ảnh của chính item.
  BOM_ITEM_IMAGE = "BOM_ITEM_IMAGE",
  // File LSX đã ký (bản scan/PDF) đính kèm trên trang chi tiết LSX
  PRODUCTION_ORDER_SIGNED_DOCUMENT = "PRODUCTION_ORDER_SIGNED_DOCUMENT",
}

export enum FileKind {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  // Ảnh ∪ tài liệu — bằng chứng IQC vừa có ảnh chụp thực tế vừa có tài liệu đo lường (PDF).
  EVIDENCE = "EVIDENCE",
}

/**
 * Mirrors the backend's FileResDto — returned by POST /api/files and embedded in
 * every entity response (`product.image`, `user.avatar`, `consumable.image`).
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

// Tài liệu văn phòng, trình chiếu, bản vẽ kỹ thuật, biểu mẫu và file nén (khớp với backend FilesService.DOCUMENT_MIME_TYPES).
// File thực thi, script và macro độc hại (.docm, .xlsm, .pptm) bị chặn.
export const ACCEPTED_DOCUMENT_TYPES = {
  // PDF & Văn bản
  "application/pdf": [".pdf"],
  "application/rtf": [".rtf"],
  "application/epub+zip": [".epub"],

  // Microsoft Office OOXML (Word, Excel, PowerPoint & Templates)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": [
    ".dotx",
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": [
    ".xltx",
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": [
    ".ppsx",
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.template": [
    ".potx",
  ],

  // OpenDocument (LibreOffice / OpenOffice)
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/vnd.oasis.opendocument.text-template": [".ott"],
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
  "application/vnd.oasis.opendocument.spreadsheet-template": [".ots"],
  "application/vnd.oasis.opendocument.presentation": [".odp"],
  "application/vnd.oasis.opendocument.presentation-template": [".otp"],
  "application/vnd.oasis.opendocument.graphics": [".odg"],

  // Bản vẽ kỹ thuật & Sơ đồ (AutoCAD, Visio)
  "image/vnd.dwg": [".dwg"],
  "application/vnd.visio": [".vsdx"],

  // Apple iWork
  "application/vnd.apple.pages": [".pages"],
  "application/vnd.apple.numbers": [".numbers"],
  "application/vnd.apple.keynote": [".key"],

  // Tệp nén / Lưu trữ (Archives)
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "application/x-7z-compressed": [".7z"],
  "application/x-tar": [".tar"],
  "application/gzip": [".gz"],
  "application/x-bzip2": [".bz2"],
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
