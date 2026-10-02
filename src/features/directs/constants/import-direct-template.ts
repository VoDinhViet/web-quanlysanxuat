import { directImportFields } from "@/lib/types/direct.type"
import type { DirectImportKey } from "@/lib/types/direct.type"

// Header cells are the backend's column identity (ITEM_IMPORT_FIELDS) — they must match the
// Excel template exactly. Order mirrors `directImportFields`.
const headerByKey: Record<DirectImportKey, string> = {
  code: "Mã vật tư",
  revision: "Phiên bản",
  name: "Tên vật tư",
  unitCode: "Mã đơn vị tính",
  supplierCode: "Mã nhà cung cấp",
  clientCode: "Mã khách hàng",
  minStock: "Định mức tồn tối thiểu",
  specificWeight: "Trọng lượng riêng",
  directGrade: "Mác vật tư",
  technicalStandard: "Tiêu chuẩn kỹ thuật",
  dimensions: "Quy cách",
  colorSurface: "Màu/Bề mặt",
  origin: "Xuất xứ",
  leadTime: "Thời gian giao hàng",
  description: "Mô tả",
  note: "Ghi chú",
}

export const importTemplateHeaders: string[] = directImportFields.map(
  ({ key }) => headerByKey[key]
)

export const IMPORT_MAX_ROWS = 1000
