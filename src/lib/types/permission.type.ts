/**
 * Mirror of the backend permission catalogue
 * (`be-quanlysanxuat/src/constants/permission.constant.ts`). Permissions are
 * `resource:action` strings granted to a role; `system:manage` is superadmin
 * god-mode and bypasses every check. Keep this list in sync with the backend.
 */
export const PERMISSION_CODES = [
  "system:manage",

  "users:create",
  "users:update",

  "roles:read",
  "roles:create",
  "roles:update",
  "roles:delete",

  "clients:read",
  "clients:create",
  "clients:update",
  "clients:delete",

  "items:read",
  "items:create",
  "items:update",
  "items:copy",
  "items:bom-manage",

  "operations:read",

  "suppliers:read",
  "suppliers:create",
  "suppliers:update",
  "suppliers:delete",

  "orders:read",
  "orders:create",
  "orders:update",
  "orders:approve",

  "inventory:read",
  "inventory:create",
  "inventory:update",
  "inventory:delete",

  "inventory-requisitions:read",
  "inventory-requisitions:create",
  "inventory-requisitions:update",
  "inventory-requisitions:delete",
  "inventory-requisitions:approve",
  "inventory-requisitions:issue",

  "production:read",
  "production:create",
  "production:update",
  "production:approve",

  "purchase-requests:read",
  "purchase-requests:create",
  "purchase-requests:update",
  "purchase-requests:delete",
  "purchase-requests:approve",

  "purchasing:read",
  "purchasing:create",
  "purchasing:update",
  "purchasing:delete",
  "purchasing:approve",

  "iqc:read",
  "iqc:create",
  "iqc:update",
  "iqc:delete",

  "outsourcing:read",
  "outsourcing:create",
  "outsourcing:update",
  "outsourcing:delete",

  "oqc:read",
  "oqc:create",
  "oqc:update",
  "oqc:delete",

  "qc-aql:read",
  "qc-aql:create",
  "qc-aql:update",

  "outbound:read",
  "outbound:create",
  "outbound:update",
  "outbound:approve",

  "reports:read",
] as const

export type PermissionCode = (typeof PERMISSION_CODES)[number]

/** Any role holding this passes every authorization check (superadmin). */
export const SUPER_PERMISSION: PermissionCode = "system:manage"

/** Vietnamese label for a single permission code, used by the role editor's checkbox matrix. */
export const permissionLabels: Record<PermissionCode, string> = {
  "system:manage": "Toàn quyền hệ thống (Super Admin)",

  "users:create": "Tạo nhân sự",
  "users:update": "Sửa nhân sự",

  "roles:read": "Xem vai trò",
  "roles:create": "Tạo vai trò",
  "roles:update": "Sửa vai trò",
  "roles:delete": "Xoá vai trò",

  "clients:read": "Xem khách hàng",
  "clients:create": "Tạo khách hàng",
  "clients:update": "Sửa khách hàng",
  "clients:delete": "Xoá khách hàng",

  "items:read": "Xem sản phẩm & vật tư",
  "items:create": "Tạo sản phẩm & vật tư",
  "items:update": "Sửa sản phẩm & vật tư",
  "items:copy": "Sao chép sản phẩm & vật tư",
  "items:bom-manage": "Quản lý BOM & quy trình",

  "operations:read": "Xem công đoạn",

  "suppliers:read": "Xem nhà cung cấp",
  "suppliers:create": "Tạo nhà cung cấp",
  "suppliers:update": "Sửa nhà cung cấp",
  "suppliers:delete": "Xoá nhà cung cấp",

  "orders:read": "Xem đơn hàng",
  "orders:create": "Tạo đơn hàng",
  "orders:update": "Sửa đơn hàng",
  "orders:approve": "Duyệt đơn hàng",

  "inventory:read": "Xem kho",
  "inventory:create": "Tạo phiếu kho",
  "inventory:update": "Sửa phiếu kho",
  "inventory:delete": "Xoá phiếu kho",

  "inventory-requisitions:read": "Xem phiếu lãnh vật tư",
  "inventory-requisitions:create": "Tạo phiếu lãnh vật tư",
  "inventory-requisitions:update": "Sửa phiếu lãnh vật tư",
  "inventory-requisitions:delete": "Xoá phiếu lãnh vật tư",
  "inventory-requisitions:approve": "Duyệt phiếu lãnh vật tư",
  "inventory-requisitions:issue": "Xuất kho theo phiếu lãnh",

  "production:read": "Xem sản xuất",
  "production:create": "Tạo lệnh/kế hoạch sản xuất",
  "production:update": "Sửa lệnh/kế hoạch sản xuất",
  "production:approve": "Duyệt lệnh sản xuất",

  "purchase-requests:read": "Xem đề xuất mua hàng",
  "purchase-requests:create": "Tạo đề xuất mua hàng",
  "purchase-requests:update": "Sửa đề xuất mua hàng",
  "purchase-requests:delete": "Xoá đề xuất mua hàng",
  "purchase-requests:approve": "Duyệt đề xuất mua hàng",

  "purchasing:read": "Xem mua hàng (RFQ/PO/thanh toán)",
  "purchasing:create": "Tạo RFQ/PO/yêu cầu thanh toán",
  "purchasing:update": "Sửa RFQ/PO/yêu cầu thanh toán",
  "purchasing:delete": "Xoá RFQ/PO/yêu cầu thanh toán",
  "purchasing:approve": "Duyệt RFQ/PO/yêu cầu thanh toán",

  "iqc:read": "Xem IQC",
  "iqc:create": "Tạo phiếu IQC",
  "iqc:update": "Sửa phiếu IQC",
  "iqc:delete": "Xoá phiếu IQC",

  "outsourcing:read": "Xem gia công ngoài",
  "outsourcing:create": "Tạo phiếu gia công ngoài",
  "outsourcing:update": "Sửa phiếu gia công ngoài",
  "outsourcing:delete": "Xoá phiếu gia công ngoài",

  "oqc:read": "Xem OQC",
  "oqc:create": "Tạo phiếu OQC",
  "oqc:update": "Sửa phiếu OQC",
  "oqc:delete": "Xoá phiếu OQC",

  "qc-aql:read": "Xem kế hoạch lấy mẫu AQL",
  "qc-aql:create": "Tạo kế hoạch lấy mẫu AQL",
  "qc-aql:update": "Sửa kế hoạch lấy mẫu AQL",

  "outbound:read": "Xem giao hàng",
  "outbound:create": "Tạo phiếu giao hàng",
  "outbound:update": "Sửa phiếu giao hàng",
  "outbound:approve": "Duyệt phiếu giao hàng",

  "reports:read": "Xem báo cáo tổng quan",
}

type PermissionGroup = {
  label: string
  codes: PermissionCode[]
}

/** Groups `PERMISSION_CODES` by resource, in menu order, for the role editor's checkbox matrix —
 *  `system:manage` stands alone (it isn't a resource action, it bypasses every check). */
export const permissionGroups: PermissionGroup[] = [
  { label: "Hệ thống", codes: ["system:manage"] },
  { label: "Nhân sự", codes: ["users:create", "users:update"] },
  {
    label: "Phân quyền",
    codes: ["roles:read", "roles:create", "roles:update", "roles:delete"],
  },
  {
    label: "Khách hàng",
    codes: [
      "clients:read",
      "clients:create",
      "clients:update",
      "clients:delete",
    ],
  },
  {
    label: "Sản phẩm & vật tư",
    codes: [
      "items:read",
      "items:create",
      "items:update",
      "items:copy",
      "items:bom-manage",
    ],
  },
  { label: "Công đoạn", codes: ["operations:read"] },
  {
    label: "Nhà cung cấp",
    codes: [
      "suppliers:read",
      "suppliers:create",
      "suppliers:update",
      "suppliers:delete",
    ],
  },
  {
    label: "Đơn hàng (SO)",
    codes: ["orders:read", "orders:create", "orders:update", "orders:approve"],
  },
  {
    label: "Kho (nhập/xuất/tồn)",
    codes: [
      "inventory:read",
      "inventory:create",
      "inventory:update",
      "inventory:delete",
    ],
  },
  {
    label: "Lãnh vật tư",
    codes: [
      "inventory-requisitions:read",
      "inventory-requisitions:create",
      "inventory-requisitions:update",
      "inventory-requisitions:delete",
      "inventory-requisitions:approve",
      "inventory-requisitions:issue",
    ],
  },
  {
    label: "Sản xuất",
    codes: [
      "production:read",
      "production:create",
      "production:update",
      "production:approve",
    ],
  },
  {
    label: "Đề xuất mua hàng",
    codes: [
      "purchase-requests:read",
      "purchase-requests:create",
      "purchase-requests:update",
      "purchase-requests:delete",
      "purchase-requests:approve",
    ],
  },
  {
    label: "Mua hàng (RFQ/PO/thanh toán)",
    codes: [
      "purchasing:read",
      "purchasing:create",
      "purchasing:update",
      "purchasing:delete",
      "purchasing:approve",
    ],
  },
  {
    label: "IQC",
    codes: ["iqc:read", "iqc:create", "iqc:update", "iqc:delete"],
  },
  {
    label: "Gia công ngoài",
    codes: [
      "outsourcing:read",
      "outsourcing:create",
      "outsourcing:update",
      "outsourcing:delete",
    ],
  },
  {
    label: "OQC",
    codes: ["oqc:read", "oqc:create", "oqc:update", "oqc:delete"],
  },
  {
    label: "AQL lấy mẫu",
    codes: ["qc-aql:read", "qc-aql:create", "qc-aql:update"],
  },
  {
    label: "Giao hàng (DO)",
    codes: [
      "outbound:read",
      "outbound:create",
      "outbound:update",
      "outbound:approve",
    ],
  },
  { label: "Báo cáo", codes: ["reports:read"] },
]
