import type { FileResource } from "@/lib/types/file.type"
import type { PaymentTerm } from "@/lib/types/payment-term.type"

export enum SupplierStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
}

export const supplierStatusLabels: Record<SupplierStatus, string> = {
  [SupplierStatus.ACTIVE]: "Đang hoạt động",
  [SupplierStatus.PAUSED]: "Tạm ngưng",
  [SupplierStatus.STOPPED]: "Đã ngừng hợp tác",
}

export enum SupplierType {
  INDIVIDUAL = "INDIVIDUAL",
  COMPANY = "COMPANY",
  HOUSEHOLD = "HOUSEHOLD",
}

export const supplierTypeLabels: Record<SupplierType, string> = {
  [SupplierType.INDIVIDUAL]: "Cá nhân",
  [SupplierType.COMPANY]: "Công ty",
  [SupplierType.HOUSEHOLD]: "Hộ kinh doanh",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
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

/** Lightweight reference to a supplier itself (GET /api/suppliers) — used by
 *  other domains' nested relation (e.g. Material.preferredSupplier). */
export type SupplierRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's SupplierRepresentativeResDto — a supplier can have
 *  several representatives; at most one has `isPrimary: true`. */
export type SupplierRepresentative = {
  id: string
  name: string
  phoneNumber: string | null
  isPrimary: boolean
}

/** The representative to show when only one can be displayed — the one marked
 *  `isPrimary`, or the first if none is. */
export function getPrimaryRepresentative(
  representatives: SupplierRepresentative[]
): SupplierRepresentative | undefined {
  return representatives.find((rep) => rep.isPrimary) ?? representatives[0]
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

/** Mirrors the backend's SupplierFileResDto — a join row carrying the
 *  registry file it points at. */
export type SupplierFile = {
  id: string
  file: FileResource
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
  logo: FileResource | null
  country: CountryRef | null
  payment: SupplierPayment
  rating: number | null
  status: SupplierStatus
  internalNote: string | null
  files: SupplierFile[]
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
