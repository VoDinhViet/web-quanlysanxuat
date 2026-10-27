<!-- Generated: 2026-10-27 | Files scanned: 125 | Token estimate: ~5000 -->
# Routes codemap (web)

All 125 files under `src/routes/`. Tree shape and guard flow: `architecture.md`. Screen/button maps: `docs/ui-flow.md`. Gate model: `identity-access.md`.

## How to read
- File column is relative to `src/routes/(authed)/manage_/` (shell rows give the full path). Page = component the route renders, from `src/features/<Feature>/pages/`.
- Preloads = `<name>QueryOptions` factories called in the route `loader` (suffix dropped). Names without `(bg)` are normally awaited with `staleTime: "static"`; `(bg)` = fire-and-forget `void query(...).catch(noop)`. `-` = no loader (page reads client-side). `department` = unfiltered department options, `item`/`items` = `products` feature.
- Gate = `routePermissions` entry in `src/lib/route-permissions.ts`, enforced once in `(authed)/route.tsx` beforeLoad; all matched routes' codes are ANDed, denial redirects `/manage`. "any" = signed-in user. Sidebar visibility uses the same map (`canAccessRoute`).
- Layout wrappers: every list/create folder `<slug>/` holds `route.tsx` (34 files: `PageTitleBar` + `<Outlet/>`, no loader; `inventory-requisitions` uses `PageShell`) beside `index.tsx` (list loader, `PagePending`). They are not repeated below. `$id` / `create` / `update` leaves live in sibling `<slug>_/`.
- Trailing `_` on a folder or on `$id_` means the URL nests under the parent path but the page does not render inside the parent layout.
- URL search params: lists validate `page`, `limit`, `q`, `order` + filters (`schemas/*-search.schema.ts`). Detail/create routes with their own `validateSearch`: `production-jobs/$id` and `products/$id` and `products/$id/bom/$bomItemId` (`tab`), `inventory-receipts/create-receipt` (`lane` = po | other | return), `production-execution/$id` (`operationId`, the only `loaderDeps`), `inventory-products/$itemId`, `outbound-orders/$id`, `inventory-requisitions/create`, `outsourcing-orders/create`.

## Shell
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/` | `src/routes/index.tsx` | redirect `/manage` | - | - | none |
| (root) | `src/routes/__root.tsx` | `RootDocument` shell | - | - | none |
| `/login` | `src/routes/(auth)/login.tsx` | LoginPage in `(auth)/route.tsx` AuthLayout | auth | - | public |
| (all authed) | `src/routes/(authed)/route.tsx` | AuthedLayout: sidebar shell, session watchdog, shared errorComponent | auth | currentPermissions, currentUser, currentSession (beforeLoad, static) | session required |
| `/ui-gallery` | `src/routes/(authed)/ui-gallery.tsx` | UiGalleryPage | ui-gallery | - | any (not in sidebar) |
| `/manage` (sidebar group "Tổng quan") | `src/routes/(authed)/manage.tsx` (not under `manage_/`) | ManagePage | manage | upcomingDeliveries(bg), jobDueDate(bg), outsourcingOrderDueDate(bg), productionProgress(bg), qcPassRate(bg), reportAlerts(bg), reportStats(bg) | `null` in map; beforeLoad `reports:read` else first readable list |

### Quản lý bán hàng
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/orders` | `orders/index.tsx` | OrdersPage | orders | orderStats(bg), orders | orders:read |
| `/manage/orders/$orderId` | `orders_/$orderId.tsx` | OrderDetailPage | orders | orderItems, order | orders:read |
| `/manage/orders/$orderId/update` | `orders_/$orderId_.update.tsx` | UpdateOrderPage | orders | orderItems, order | orders:update |
| `/manage/orders/create` | `orders_/create.tsx` | CreateOrderPage | orders | - | orders:create |
| `/manage/outbound-orders` | `outbound-orders/index.tsx` | OutboundOrdersPage | outbound-orders | outboundOrders (stat tiles query stats client-side) | outbound:read |
| `/manage/outbound-orders/$outboundOrderId` | `outbound-orders_/$outboundOrderId.tsx` | OutboundOrderDetailPage | outbound-orders | outboundOrderItems, outboundOrder | outbound:read |
| `/manage/outbound-orders/create` | `outbound-orders_/create.tsx` | CreateOutboundOrderPage | outbound-orders | - | outbound:create |

### Quản lý sản xuất
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/production-orders` | `production-orders/index.tsx` | ProductionOrdersPage | production-orders | productionOrders | production:read |
| `/manage/production-orders/$productionOrderId` | `production-orders_/$productionOrderId.tsx` | ProductionOrderDetailPage | production-orders | order, productionOrderLogs(bg), productionOrder | production:read |
| `/manage/production-jobs` | `production-jobs/index.tsx` | ProductionJobsPage | production-jobs | productionJobs, clients | production:read |
| `/manage/production-jobs/$productionJobId` | `production-jobs_/$productionJobId.tsx` | ProductionJobDetailPage | production-jobs | productionJob, item | production:read |
| `/manage/production-execution` | `production-execution/index.tsx` | ProductionExecutionPage | production-execution | clients, productionJobsByOperation, productionExecutionOperations | production-execution:read |
| `/manage/production-execution/$productionJobId` | `production-execution_/$productionJobId.tsx` | ProductionExecutionJobPage | production-execution | productionExecutionJobOperations, productionExecutionJob | production-execution:read |
| `/manage/inventory-requisitions` | `inventory-requisitions/index.tsx` | InventoryRequisitionsPage | inventory-requisitions | inventoryRequisitions | inventory-requisitions:read |
| `/manage/inventory-requisitions/$requisitionId` | `inventory-requisitions_/$requisitionId.tsx` | InventoryRequisitionDetailPage | inventory-requisitions | inventoryRequisition | inventory-requisitions:read |
| `/manage/inventory-requisitions/create` | `inventory-requisitions_/create.tsx` | InventoryRequisitionCreatePage | inventory-requisitions | - | inventory-requisitions:create |

### Quản lý mua hàng
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/purchase-requests` | `purchase-requests/index.tsx` | PurchaseRequestsPage | purchase-requests | department, purchaseRequests | purchase-requests:read |
| `/manage/purchase-requests/$purchaseRequestId` | `purchase-requests_/$purchaseRequestId.tsx` | PurchaseRequestDetailPage | purchase-requests | purchaseRequest | purchase-requests:read |
| `/manage/purchase-requests/create` | `purchase-requests_/create.tsx` | PurchaseRequestCreatePage | purchase-requests | - | purchase-requests:create |
| `/manage/purchase-quotations` | `purchase-quotations/index.tsx` | PurchaseQuotationsPage | purchase-quotations | purchaseQuotations | purchasing:read |
| `/manage/purchase-quotations/$purchaseQuotationId` | `purchase-quotations_/$purchaseQuotationId.tsx` | PurchaseQuotationDetailPage | purchase-quotations | purchaseQuotationComparison, purchaseQuotation | purchasing:read |
| `/manage/purchase-quotations/$purchaseQuotationId/update` | `purchase-quotations_/$purchaseQuotationId_.update.tsx` | UpdateQuotationPage | purchase-quotations | purchaseQuotationComparison, purchaseQuotation | purchasing:update |
| `/manage/purchase-quotations/create` | `purchase-quotations_/create.tsx` | CreateQuotationPage | purchase-quotations | - | purchasing:create |
| `/manage/purchase-ledger` | `purchase-ledger/index.tsx` | PurchaseLedgerPage | purchase-ledger | purchaseLedger | purchasing:read |
| `/manage/purchase-orders` | `purchase-orders/index.tsx` | PurchaseOrdersPage | purchase-orders | purchaseOrders, supplierOptions | purchasing:read |
| `/manage/purchase-orders/$purchaseOrderId` | `purchase-orders_/$purchaseOrderId.tsx` | PurchaseOrderDetailPage | purchase-orders | purchaseOrder | purchasing:read |
| `/manage/payment-requests` | `payment-requests/index.tsx` | PaymentRequestsPage | payment-requests | paymentRequests, supplierOptions | purchasing:read |
| `/manage/payment-requests/$paymentRequestId` | `payment-requests_/$paymentRequestId.tsx` | PaymentRequestDetailPage | payment-requests | paymentRequest | purchasing:read |
| `/manage/supplier-returns` | `supplier-returns/index.tsx` | SupplierReturnsPage | supplier-returns | supplierReturns, supplierOptions | inventory:read |
| `/manage/supplier-returns/$supplierReturnId` | `supplier-returns_/$supplierReturnId.tsx` | SupplierReturnDetailPage | supplier-returns | item, supplierReturn, supplier | inventory:read |

### Quản lý kho
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/inventory-receipts` | `inventory-receipts/index.tsx` | InventoryReceiptsPage | inventory-receipts | inventoryReceipts | inventory:read |
| `/manage/inventory-receipts/$inventoryReceiptId` | `inventory-receipts_/$inventoryReceiptId.tsx` | InventoryReceiptDetailPage | inventory-receipts | inventoryReceipt | inventory:read |
| `/manage/inventory-receipts/$inventoryReceiptId/update` | `inventory-receipts_/$inventoryReceiptId_.update.tsx` | UpdateInventoryReceiptPage | inventory-receipts | inventoryReceipt | inventory:update |
| `/manage/inventory-receipts/create-receipt` | `inventory-receipts_/create-receipt.tsx` | CreateInventoryReceiptReceiptPage | inventory-receipts | - | inventory:create |
| `/manage/finished-goods-issues` | `finished-goods-issues/index.tsx` | FinishedGoodsIssuesPage | inventory-issues | inventoryIssues (SALES) | inventory:read |
| `/manage/inventory-issues` | `inventory-issues/index.tsx` | InventoryIssuesPage | inventory-issues | inventoryIssues | inventory:read |
| `/manage/inventory-issues/$issueId` | `inventory-issues_/$issueId.tsx` | InventoryIssueDetailPage | inventory-issues | inventoryIssue | inventory:read |
| `/manage/inventory-directs` | `inventory-directs/index.tsx` | InventoryDirectsPage | inventory-directs | directInventory, supplierOptions | inventory:read |
| `/manage/inventory-products` | `inventory-products/index.tsx` | InventoryProductsPage | inventory-products | inventoryProducts | inventory:read |
| `/manage/inventory-products/$itemId` | `inventory-products_/$itemId.tsx` | InventoryProductDetailPage | inventory-products | itemInventory, item | inventory:read |

### Gia công ngoài
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/outsourcing-orders` | `outsourcing-orders/index.tsx` | OutsourcingOrdersPage | outsourcing-orders | outsourcingOrders | outsourcing:read |
| `/manage/outsourcing-orders/$outsourcingOrderId` | `outsourcing-orders_/$outsourcingOrderId.tsx` | OutsourcingOrderDetailPage | outsourcing-orders | outsourcingOrderItems, outsourcingOrder | outsourcing:read |
| `/manage/outsourcing-orders/create` | `outsourcing-orders_/create.tsx` | CreateOutsourcingOrderPage | outsourcing-orders | - | outsourcing:create |
| `/manage/outsourcing-orders/create-standalone` | `outsourcing-orders_/create-standalone.tsx` | CreateStandaloneOutsourcingOrderPage | outsourcing-orders | - | outsourcing:create |
| `/manage/outsourcing-orders/$outsourcingOrderId/update` | `outsourcing-orders_/$outsourcingOrderId_.update.tsx` | UpdateOutsourcingOrderPage | outsourcing-orders | outsourcingOrderItems, outsourcingOrder | outsourcing:update (redirects unless DRAFT/REJECTED) |
| `/manage/outsourcing-receipts` | `outsourcing-receipts/index.tsx` | OutsourcingReceiptsPage | outsourcing-receipts | outsourcingReceipts, supplierOptions | outsourcing:read |
| `/manage/outsourcing-receipts/$outsourcingReceiptId` | `outsourcing-receipts_/$outsourcingReceiptId.tsx` | OutsourcingReceiptDetailPage | outsourcing-receipts | outsourcingReceiptItems, outsourcingReceipt | outsourcing:read |
| `/manage/outsourcing-receipts/create` | `outsourcing-receipts_/create.tsx` | CreateOutsourcingReceiptPage | outsourcing-receipts | - | outsourcing:create |

### Kiểm tra chất lượng (QC)
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/iqc` | `iqc/index.tsx` | IqcPage | iqc | iqcStats, iqcs, supplierOptions | iqc:read |
| `/manage/iqc/$iqcId` | `iqc_/$iqcId.tsx` | IqcDetailPage | iqc | department, iqc, item | iqc:read |
| `/manage/oqc` | `oqc/index.tsx` | OqcPage | oqc | oqcs | oqc:read |
| `/manage/oqc/$oqcId` | `oqc_/$oqcId.tsx` | OqcDetailPage | oqc | oqc, item | oqc:read |
| `/manage/ncrs` | `ncrs/index.tsx` | NcrsPage | ncrs | ncrs | ncr:read |
| `/manage/ncrs/$ncrId` | `ncrs_/$ncrId.tsx` | NcrDetailPage | ncrs | ncr | ncr:read |
| `/manage/ncrs/create` | `ncrs_/create.tsx` | NcrCreatePage | ncrs | - | ncr:create |

### Danh mục
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/clients` | `clients/index.tsx` | ClientsPage | clients | clientGroupOptions, clients | clients:read |
| `/manage/clients/$clientId/update` | `clients_/$clientId.update.tsx` | UpdateClientPage | clients | clientGroupOptions, client | clients:update |
| `/manage/clients/create` | `clients_/create/index.tsx` | CreateClientPage | clients | clientGroupOptions | clients:create |
| `/manage/suppliers` | `suppliers/index.tsx` | SuppliersPage | suppliers | countryOptions, supplierGroupOptions, supplierStats(bg), suppliers | suppliers:read |
| `/manage/suppliers/$supplierId` | `suppliers_/$supplierId.tsx` | SupplierDetailPage | suppliers | supplierGroupOptions, supplier, countryOptions | suppliers:read |
| `/manage/suppliers/$supplierId/update` | `suppliers_/$supplierId.update.tsx` | UpdateSupplierPage | suppliers | supplierGroupOptions, supplier, countryOptions | suppliers:update |
| `/manage/suppliers/create` | `suppliers_/create/index.tsx` | CreateSupplierPage | suppliers | countryOptions, supplierGroupOptions | suppliers:create |
| `/manage/products` | `products/index.tsx` | ProductsPage | products | clientOptions, items | items:read |
| `/manage/products/$productId` | `products_/$productId.tsx` | ProductDetailPage | products | item, unitOptions | items:read |
| `/manage/products/$productId/bom/$bomItemId` | `products_/$productId_/bom/$bomItemId.tsx` | BomItemDetailPage | products | bomItemOperations, itemBom, item, unitOptions | items:read |
| `/manage/products/create` | `products_/create/index.tsx` | CreateProductPage | products | unitOptions | items:create |
| `/manage/directs` | `directs/index.tsx` | DirectsPage | directs | directs, clients | items:read |
| `/manage/directs/$directId/update` | `directs_/$directId.update.tsx` | UpdateDirectPage | directs | direct, supplierOptions, unitOptions | items:update |
| `/manage/directs/create` | `directs_/create/index.tsx` | CreateDirectPage | directs | supplierOptions, unitOptions | items:create |
| `/manage/directs/import` | `directs_/import/index.tsx` | ImportDirectsPage | directs | - | items:create |

### Danh mục (second sidebar group, settings)
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/settings` | `settings/route.tsx` | SettingsLayout (tab strip "Đơn vị tính" / "Nhóm vật tư" / "Công đoạn sản xuất", tabs filtered by permission) | auth, operations, units | currentPermissions, operations, units | any (`canAccessRoute`: `items:read` or `operations:read`) |
| `/manage/settings` (index) | `settings/index.tsx` | redirect to `/manage/settings/units`, or `/operations` when only `operations:read` | - | - | any |
| `/manage/settings/units` | `settings/units.tsx` | UnitsPage | units | units | items:read |
| `/manage/settings/item-categories` | `settings/item-categories.tsx` | ItemCategoriesPage | item-categories | item-categories | items:read |
| `/manage/settings/operations` | `settings/operations.tsx` | OperationsPage | operations | operations | operations:read |
| `/manage/operations/$operationId` | `operations_/$operationId.tsx` | OperationDetailPage | operations | operation | operations:read |
| `/manage/units`, `/manage/operations` | `units/`, `operations/` (`route.tsx` + `index.tsx`) | redirect to `/manage/settings/units`, `/manage/settings/operations?page=1&limit=10` | - | - | items:read, operations:read |
| `/manage/operations/$operationId` | `operations_/$operationId.tsx` | OperationDetailPage | operations | operation | operations:read |

### Hệ thống
| URL | File | Page | Feature | Preloads | Gate |
|---|---|---|---|---|---|
| `/manage/users` | `users/index.tsx` | UsersPage | users | users | users:update |
| `/manage/users/$userId/update` | `users_/$userId.update.tsx` | UpdateUserPage | users | department, positionOptions, user, roles | users:update |
| `/manage/users/create` | `users_/create/index.tsx` | CreateUserPage | users | department, positionOptions, roles | users:create |
| `/manage/roles` | `roles/index.tsx` | RolesPage | roles | roles | roles:read |
| `/manage/roles/$roleId/update` | `roles_/$roleId.update.tsx` | UpdateRolePage | roles | permissionCatalogue, role | roles:update |
| `/manage/roles/create` | `roles_/create.tsx` | CreateRolePage | roles | permissionCatalogue | roles:create |
| `/manage/departments` | `departments/index.tsx` | DepartmentsPage | departments | departments | departments:read |
| `/manage/departments/$departmentId` | `departments_/$departmentId.tsx` | DepartmentDetailPage | departments | departmentDetail | departments:read |
