export const INVENTORY_IMPORT_MAX_ROWS = 1000
export const INVENTORY_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024

/** Khớp `INVENTORY_IMPORT_TEMPLATE_COLUMNS` của BE (be-quanlysanxuat inventory-direct.import.ts) —
 *  dòng tiêu đề là cách nhận diện file mẫu. */
export const inventoryImportHeaders = [
  "Mã vật tư",
  "Phiên bản",
  "Tên vật tư",
  "ĐVT",
  "Tồn hiện tại",
  "Tồn thực tế",
  "Ghi chú",
]
