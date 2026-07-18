export enum SupplierStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  [SupplierStatus.ACTIVE]: "Đang hoạt động",
  [SupplierStatus.PAUSED]: "Tạm ngưng",
  [SupplierStatus.STOPPED]: "Đã ngừng hợp tác",
}

export enum SupplierType {
  INDIVIDUAL = "INDIVIDUAL",
  COMPANY = "COMPANY",
  HOUSEHOLD = "HOUSEHOLD",
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  [SupplierType.INDIVIDUAL]: "Cá nhân",
  [SupplierType.COMPANY]: "Công ty",
  [SupplierType.HOUSEHOLD]: "Hộ kinh doanh",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
}

export enum PaymentTerm {
  IMMEDIATE = "IMMEDIATE",
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_60 = "NET_60",
}

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "Thanh toán ngay",
  [PaymentTerm.NET_15]: "Net 15 ngày",
  [PaymentTerm.NET_30]: "Net 30 ngày",
  [PaymentTerm.NET_60]: "Net 60 ngày",
}

/** Mirrors the backend's nested supplier-group relation (GET /api/supplier-groups). */
export type SupplierGroupRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's nested country relation (GET /api/countries). */
export type CountryRef = {
  id: string
  code: string
  name: string
  logoUrl: string | null
}

/** Mirrors the backend's nested creator relation. */
export type SupplierCreatorRef = {
  id: string
  username: string
}

/** Mirrors the backend's SupplierRepresentativeResDto — a supplier can have
 *  several representatives; at most one has `isPrimary: true`. */
export type SupplierRepresentative = {
  id: string
  name: string
  phoneNumber: string | null
  isPrimary: boolean
}

/** Mirrors the backend's SupplierPaymentResDto — always present, sub-fields nullable. */
export type SupplierPayment = {
  bankName: string | null
  bankAccountNumber: string | null
  bankAccountHolder: string | null
  bankBranch: string | null
  defaultPaymentMethod: PaymentMethod | null
  defaultPaymentTerm: PaymentTerm | null
  creditLimit: number | null
  creditLimitStartDate: string | null
}

/** Mirrors the backend's SupplierAttachmentResDto. */
export type SupplierAttachment = {
  id: string
  url: string
  filename: string
  mimetype: string | null
  size: number | null
}

/** Attachment item shape when creating/updating a supplier (no `id` yet — the
 *  backend assigns one only after the file is attached to a saved supplier). */
export type SupplierAttachmentInput = {
  url: string
  filename: string
  mimetype: string | null
  size: number | null
}

/** Mirrors the backend's SupplierResDto (GET /api/suppliers, GET /api/suppliers/:id). */
export type Supplier = {
  id: string
  code: string
  name: string
  group: SupplierGroupRef
  type: SupplierType
  taxCode: string
  phoneNumber: string
  email: string | null
  representatives: SupplierRepresentative[]
  address: string
  note: string | null
  logoUrl: string | null
  country: CountryRef | null
  payment: SupplierPayment
  rating: number | null
  status: SupplierStatus
  internalNote: string | null
  attachments: SupplierAttachment[]
  creator: SupplierCreatorRef | null
  createdAt: string
  updatedAt: string
}

/** Aggregate counts for the list page's summary stat cards. */
export type SupplierStats = {
  total: number
  active: number
  paused: number
  stopped: number
}
