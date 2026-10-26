<!-- Generated: 2026-10-26 | Files scanned: 307 | Token estimate: ~4800 -->
# Purchasing codemap (web)

Scope: FE features `purchase-requests` (PR), `purchase-quotations` (RFQ), `purchase-orders` (PO/DMH), `purchase-ledger`, `payment-requests` (YCTT), `suppliers` (+ supplier-groups call). BE twin: `be-quanlysanxuat/docs/CODEMAPS/purchasing.md` (state flow sections "RFQ -> DMH" and "Payment request"); screens and button labels: `docs/ui-flow.md`. Permission gate source: `src/lib/route-permissions.ts` (enforced once in `src/routes/(authed)/route.tsx`); `PermissionGate` only hides buttons, BE is the real check.

## 1. Features

| Feature folder | Role | Screens (pages/) | Types & status labels | Schemas |
|---|---|---|---|---|
| `src/features/purchase-requests` | PR with line editing, approval, purchasable flag | PurchaseRequestsPage, PurchaseRequestCreatePage, PurchaseRequestDetailPage | `purchase-request.type.ts`: DRAFT "Nháp", PENDING_APPROVAL "Chờ duyệt", APPROVED "Đã duyệt", REJECTED "Từ chối" | 6 files (create, items, search, reject, note) |
| `src/features/purchase-quotations` | RFQ, supplier comparison, approve creates POs | PurchaseQuotationsPage, CreateQuotationPage, PurchaseQuotationDetailPage, UpdateQuotationPage | `purchase-quotation.type.ts`: DRAFT "Nháp", PENDING_APPROVAL "Chờ duyệt", APPROVED "Đã duyệt", REJECTED "Không duyệt", CANCELLED "Đã hủy" | 6 action schemas + search |
| `src/features/purchase-orders` | PO (DMH) read, confirm, cancel, close | PurchaseOrdersPage, PurchaseOrderDetailPage | `purchase-order.type.ts`: stored PENDING_CONFIRMATION "Chờ xác nhận", ORDERED "Đã đặt hàng", CANCELLED "Đã hủy"; derived RECEIVING "Đang nhận hàng", COMPLETED "Hoàn tất" | cancel-purchase-order, close-purchase-order, purchase-orders-search |
| `src/features/purchase-ledger` | Read-only "Danh mục mua hàng" with Excel export | PurchaseLedgerPage | `purchase-ledger.type.ts`: WAITING_TO_PURCHASE "Chờ mua", QUOTING "Đang báo giá", ORDERED "Đã đặt hàng", RECEIVING "Nhập một phần", COMPLETED "Hoàn tất" | purchase-ledger-search |
| `src/features/payment-requests` | YCTT send / pay / reject / cancel, extra cost | PaymentRequestsPage, PaymentRequestDetailPage | `payment-request.type.ts`: DRAFT "Nháp", PENDING "Chờ thanh toán", REJECTED "Bị từ chối", PAID "Đã thanh toán", CANCELLED "Đã hủy"; log actions have own labels | cancel-payment-request, reject-payment-request, payment-requests-search |
| `src/features/suppliers` | Supplier master data, stats cards | SuppliersPage, CreateSupplierPage, SupplierDetailPage, UpdateSupplierPage | `supplier.type.ts`: ACTIVE "Đang hoạt động", PAUSED "Tạm ngưng", STOPPED "Đã ngừng hợp tác"; `SupplierType` and `PaymentMethod` label maps in same file | create-supplier, suppliers-search, update-supplier |

Supplier groups and countries have no screen: `getSupplierGroups` is in `suppliers/api`, countries in `src/features/countries/api` (see `sales.md`).

## 2. Screens

Routes under `src/routes/(authed)/manage_/`; each feature folder has a `route.tsx` layout (title below) and a data-owning `index.tsx` using `PagePending`.

| UI route | Route file | Page | Loader preloads | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/manage/purchase-requests` ("Quản lý mua hàng") | `purchase-requests/index.tsx` | PurchaseRequestsPage | purchaseRequestsQueryOptions, departmentQueryOptions | purchase-requests:read | sidebar |
| `/manage/purchase-requests/create` | `purchase-requests_/create.tsx` | PurchaseRequestCreatePage | none | purchase-requests:create | "Tạo đề xuất mua hàng (Manual)" |
| `/manage/purchase-requests/$purchaseRequestId` | `purchase-requests_/$purchaseRequestId.tsx` | PurchaseRequestDetailPage | purchase request (+ related notes card) | purchase-requests:read | row "Xem chi tiết" |
| `/manage/purchase-quotations` ("Báo giá NCC") | `purchase-quotations/index.tsx` | PurchaseQuotationsPage | list only | purchasing:read | sidebar |
| `/manage/purchase-quotations/create` | `purchase-quotations_/create.tsx` | CreateQuotationPage | none | purchasing:create | list create button |
| `/manage/purchase-quotations/$purchaseQuotationId` | `purchase-quotations_/$purchaseQuotationId.tsx` | PurchaseQuotationDetailPage | quotation + comparison | purchasing:read | row "Xem chi tiết" |
| `/manage/purchase-quotations/$purchaseQuotationId/update` | `purchase-quotations_/$purchaseQuotationId_.update.tsx` | UpdateQuotationPage | quotation + comparison; redirects to detail unless DRAFT | purchasing:update | "Chỉnh sửa", row "Sửa báo giá" |
| `/manage/purchase-orders` ("Đơn mua hàng") | `purchase-orders/index.tsx` | PurchaseOrdersPage | list, supplierOptions | purchasing:read | sidebar |
| `/manage/purchase-orders/$purchaseOrderId` | `purchase-orders_/$purchaseOrderId.tsx` | PurchaseOrderDetailPage | purchase order | purchasing:read | row, quotation "generated orders" card |
| `/manage/purchase-ledger` ("Danh mục mua hàng") | `purchase-ledger/index.tsx` | PurchaseLedgerPage | ledger list | purchasing:read | sidebar |
| `/manage/payment-requests` ("Yêu cầu thanh toán") | `payment-requests/index.tsx` | PaymentRequestsPage | list, supplierOptions | purchasing:read | sidebar |
| `/manage/payment-requests/$paymentRequestId` | `payment-requests_/$paymentRequestId.tsx` | PaymentRequestDetailPage | payment request | purchasing:read | row "Xem chi tiết" |
| `/manage/suppliers` ("Quản lý nhà cung cấp") | `suppliers/index.tsx` | SuppliersPage | list, supplierGroupOptions, countryOptions, stats (non-blocking) | suppliers:read | sidebar |
| `/manage/suppliers/create` | `suppliers_/create/index.tsx` | CreateSupplierPage | groups, countries | suppliers:create | "Thêm nhà cung cấp" |
| `/manage/suppliers/$supplierId` | `suppliers_/$supplierId.tsx` | SupplierDetailPage | supplier, groups, countries | suppliers:read | row "Xem chi tiết" |
| `/manage/suppliers/$supplierId/update` | `suppliers_/$supplierId.update.tsx` | UpdateSupplierPage | supplier, groups, countries | suppliers:update | row "Chỉnh sửa" |

No PO create route and no PR/payment-request update route (PR is edited in place on detail).

## 3. Actions -> endpoints

Server fn: `src/features/<feature>/api/server-functions/<name>.api.ts`. BE: `src/api/<feature>/<feature>.controller.ts:<line>`. `/api` prefix omitted; `:id` is the entity id.

### purchase-requests (perm prefix `purchase-requests:`)
| Action / trigger | Server fn | Endpoint | Perm | BE handler |
|---|---|---|---|---|
| "Duyệt" | approve-purchase-request | POST /purchase-requests/:id/approve | approve | approvePurchaseRequest :121 |
| "Thêm vật tư" | create-purchase-request-items | POST /:id/items | update | createPurchaseRequestItems :157 |
| Create form | create-purchase-request | POST /purchase-requests | create | createPurchaseRequest :73 |
| Line "Xóa" | delete-purchase-request-item | DELETE /:id/items/:itemId | update | deletePurchaseRequestItem :193 |
| "Xóa đề xuất" | delete-purchase-request | DELETE /:id | delete | deletePurchaseRequest :90 |
| Detail "In" / "Xuất" > PDF (`PurchaseRequestExportActions`) | export-purchase-request-pdf | GET /:id/export-pdf | read | exportPurchaseRequestPdf :264 |
| Related notes card | get-purchase-request-related-notes | GET /:id/related-notes | read | getRelatedNotes :279 |
| Detail loader | get-purchase-request | GET /:id | read | getPurchaseRequest :60 |
| List | get-purchase-requests | GET /purchase-requests | read | getPurchaseRequests :48 |
| "Từ chối" (reason) | reject-purchase-request | POST /:id/reject | approve | rejectPurchaseRequest :138 |
| "Gửi duyệt" / "Gửi duyệt lại" | send-purchase-request | POST /:id/send | update | sendPurchaseRequest :105 |
| Select "Mua" / "Không mua" | update-purchase-request-item-purchasable | PATCH /:id/items/:itemId/purchasable | update | updatePurchaseRequestItemPurchasable :210 |
| SL cell, note dialog | update-purchase-request-item | PATCH /:id/items/:itemId | update | updatePurchaseRequestItem :174 |
| Needed-date field | update-purchase-request-needed-date | PATCH /:id/needed-date | update | updatePurchaseRequestNeededDate :247 |
| Note "Lưu" | update-purchase-request-note | PATCH /:id/note | update | updatePurchaseRequestNote :230 |

### purchase-quotations (perm prefix `purchasing:`)
| Action / trigger | Server fn | Endpoint | Perm | BE handler |
|---|---|---|---|---|
| "Duyệt & tạo đơn mua" | approve-purchase-quotation | POST /purchase-quotations/:id/approve (`{selectedSuppliers}`) | approve | approveQuotation :159 |
| none (dialog unmounted) | cancel-purchase-quotation | POST /:id/cancel | approve | cancelQuotation :196 |
| Create wizard | create-purchase-quotation | POST /purchase-quotations | create | createQuotation :101 |
| "Xoá báo giá" | delete-purchase-quotation | DELETE /:id | delete | deleteQuotation :130 |
| Detail comparison table | get-purchase-quotation-comparison | GET /:id/comparison | read | getQuotationComparison :88 |
| Create supplier step | get-purchase-quotation-last-purchases | GET /last-purchases | read | getLastPurchases :63 |
| Related notes card | get-purchase-quotation-related-notes | GET /:id/related-notes | read | getRelatedNotes :215 |
| Detail / update loader | get-purchase-quotation | GET /:id | read | getQuotation :75 |
| List | get-purchase-quotations | GET /purchase-quotations | read | getQuotations :49 |
| "Từ chối" (RejectQuotationDialog) | reject-purchase-quotation | POST /:id/reject | approve | rejectQuotation :177 |
| "Gửi duyệt" (SendQuotationDialog) | send-purchase-quotation | POST /:id/send | update | sendQuotation :142 |
| Update form | update-purchase-quotation | PATCH /:id | update | updateQuotation :117 |

### purchase-orders (perm prefix `purchasing:`)
| Action / trigger | Server fn | Endpoint | Perm | BE handler |
|---|---|---|---|---|
| "Huỷ PO" | cancel-purchase-order | POST /purchase-orders/:id/cancel | approve | cancelPurchaseOrder :141 |
| "Đóng sớm PO" | close-purchase-order | POST /:id/close | approve | closePurchaseOrder :160 |
| "Xác nhận đặt hàng" | confirm-purchase-order | POST /:id/confirm | update | confirmPurchaseOrder :124 |
| Detail "In" / "Xuất" > PDF (`PurchaseOrderExportActions`) | export-purchase-order-pdf | GET /:id/export-pdf | read | exportPurchaseOrderPdf :181 |
| Related notes card | get-purchase-order-related-notes | GET /:id/related-notes | read | getRelatedNotes :194 |
| Detail loader | get-purchase-order | GET /:id | read | getPurchaseOrder :57 |
| Quotation "generated orders" card | get-purchase-orders-by-quotation | GET /purchase-orders (quotationId filter) | read | getPurchaseOrders :45 |
| List, receipts wizard picker | get-purchase-orders | GET /purchase-orders | read | getPurchaseOrders :45 |
| unreachable (see 5) | update-purchase-order-advance-payment | PATCH /:id/advance-payment | update | updatePurchaseOrderAdvancePayment :87 |
| unreachable | update-purchase-order-item | PATCH /:id/items/:itemId | update | updatePurchaseOrderItem :106 |
| unreachable | update-purchase-order | PATCH /:id | update | updatePurchaseOrder :70 |

### purchase-ledger and payment-requests (perm prefix `purchasing:`)
| Action / trigger | Server fn | Endpoint | Perm | BE handler |
|---|---|---|---|---|
| "Xuất Excel" | export-purchase-ledger | GET /purchase-ledger/export | read | exportPurchaseLedgers :39 |
| List, RFQ create picker | get-purchase-ledger | GET /purchase-ledger | read | getPurchaseLedgers :26 |
| "Hủy yêu cầu" (reason) | cancel-payment-request | POST /payment-requests/:id/cancel | approve | cancelPaymentRequest :208 |
| "Xuất Excel" | export-payment-requests | GET /payment-requests/export | read | exportPaymentRequests :62 |
| Logs card | get-payment-request-logs | GET /:id/logs | read | getPaymentRequestLogs :228 |
| Detail loader | get-payment-request | GET /:id | read | getPaymentRequest :74 |
| List | get-payment-requests | GET /payment-requests | read | getPaymentRequests :48 |
| "Xác nhận thanh toán" | mark-payment-request-paid | POST /:id/mark-paid | approve | markPaymentRequestPaid :86 |
| "Từ chối thanh toán" (reason) | reject-payment-request | POST /:id/reject | approve | rejectPaymentRequest :119 |
| "Đề nghị thanh toán" / "Đề nghị lại" | send-payment-request | POST /:id/send | update | sendPaymentRequest :102 |
| "Lưu phát sinh" | update-payment-request-extra-cost | PATCH /:id/extra-cost | update | updatePaymentRequestExtraCost :189 |
| Invoice field | update-payment-request-invoice | PATCH /:id/invoice | update | updatePaymentRequestInvoice :138 |
| Note field | update-payment-request-note | PATCH /:id/note | update | updatePaymentRequestNote :155 |
| Urgency toggle | update-payment-request-urgency | PATCH /:id/urgency | update | updatePaymentRequestUrgency :172 |

### suppliers (+ supplier-groups; perm prefix `suppliers:`)
| Action / trigger | Server fn | Endpoint | Perm | BE handler |
|---|---|---|---|---|
| Create form | create-supplier | POST /suppliers | create | SuppliersController.createSupplier (suppliers:74) |
| Row "Xóa" (DeleteSupplierDialog) | delete-supplier | DELETE /suppliers/:supplierId | delete | deleteSupplier (suppliers:100) |
| Group select | get-supplier-groups | GET /supplier-groups | public | SupplierGroupsController.getSupplierGroups (supplier-groups:21) |
| Stat cards | get-supplier-stats | GET /suppliers/stats | read | getSupplierStats (suppliers:51) |
| Detail / update loader | get-supplier | GET /suppliers/:supplierId | read | getSupplier (suppliers:61) |
| List, supplier pickers | get-suppliers | GET /suppliers | read | getSuppliers (suppliers:39) |
| Update form | update-supplier | PATCH /suppliers/:supplierId | update | updateSupplier (suppliers:87) |

## 4. UI state flow

PR (BE: PRS rules in BE codemap section 4):
```
DRAFT --"Gửi duyệt"--> PENDING_APPROVAL --"Duyệt"--> APPROVED
REJECTED --"Gửi duyệt lại"--> PENDING_APPROVAL ; PENDING_APPROVAL --"Từ chối"--> REJECTED
```
- Send: DRAFT or REJECTED, `purchase-requests:update`. "Từ chối"/"Duyệt": PENDING_APPROVAL, `:approve`. "Xóa đề xuất": DRAFT/REJECTED, `:delete`. Note "Lưu": any status.
- Line edit ("Thêm vật tư", SL, note, "Xóa", needed date): `canUpdate` and DRAFT/REJECTED; last line cannot be removed. After APPROVED the line control becomes "Mua"/"Không mua" (E298 if not APPROVED).
- List row icons: "Gửi duyệt" only DRAFT (detail also allows REJECTED), "Từ chối"/"Duyệt" PENDING_APPROVAL.

RFQ to PO:
```
RFQ DRAFT --"Gửi duyệt"--> PENDING_APPROVAL --"Duyệt & tạo đơn mua"--> APPROVED (one PO per supplier, PENDING_CONFIRMATION)
PENDING_APPROVAL --"Từ chối"--> REJECTED ; APPROVED --cancel (no UI)--> CANCELLED
PO PENDING_CONFIRMATION --"Xác nhận đặt hàng"--> ORDERED ; PENDING_CONFIRMATION|ORDERED --"Huỷ PO"--> CANCELLED
ORDERED --"Đóng sớm PO"--> closed (status stays ORDERED)
```
- RFQ DRAFT actions: "Xoá báo giá" (`purchasing:delete`, also list row), "Chỉnh sửa" and "Gửi duyệt" (`purchasing:update`). PENDING_APPROVAL with `purchasing:approve`: selectable compare table plus sticky approval bar; "Duyệt & tạo đơn mua" disabled until every vật tư has a selected NCC. Approve invalidates quotations, purchase-orders, purchase-requests, purchase-ledger, reports.
- PO "Xác nhận đặt hàng" disabled unless `expectedDate` and every `unitPrice` are set. "Đóng sớm PO" shown when `canClose` or `closeBlockedBy` non-empty, disabled when `!canClose`. "Huỷ PO" when status != CANCELLED and progress != COMPLETED; reason required, `reopenQuotation` choice only if quotation APPROVED.
- Receipts (RECEIVING, COMPLETED) come from inventory-receipts, created at `/manage/inventory-receipts/create-receipt?lane=po` (see inventory codemap).

Payment request (YCTT is auto-created by BE after receipt posting; no FE create):
```
DRAFT|REJECTED --"Đề nghị thanh toán"/"Đề nghị lại"--> PENDING --"Xác nhận thanh toán"--> PAID
PENDING --"Từ chối thanh toán"--> REJECTED ; DRAFT|PENDING|REJECTED --"Hủy yêu cầu"--> CANCELLED
```
- Send/"Lưu phát sinh": DRAFT or REJECTED, `purchasing:update`; send is disabled until extra cost is saved ("Vui lòng lưu chi phí phát sinh trước khi đề nghị thanh toán"). Pay/reject/cancel: `purchasing:approve`, PENDING for pay and reject, any of DRAFT/PENDING/REJECTED for cancel (actions hidden for PAID/CANCELLED).
- Extra cost editable DRAFT/REJECTED; invoice and note unless CANCELLED; urgency unless PAID/CANCELLED (all match BE gates).

Supplier: ACTIVE / PAUSED / STOPPED set in the form status select (no transition buttons). "Xóa" row action needs `suppliers:delete`; `supplier.error.in_use` blocks (BE E247).

## 5. Gaps and quirks

- `PurchaseOrderDetailPage` hard-codes `editable = false` and `advancePaymentEditable = false`: the three PATCH server fns and their components are unreachable from the UI.
- No PO create route or button; ui-flow.md still mentions "Tạo PO thủ công" / `/manage/purchase-orders/create` and PO status DRAFT (stale; code uses PENDING_CONFIRMATION).
- `cancelPurchaseQuotation` has a BE route and server fn but `CancelQuotationDialog` is never mounted.
- RFQ create picker reads PR lines through the ledger (`purchaseLedgerQueryOptions`, `hasRemainingQuotation`, status "Chờ mua"/"Đang báo giá"), not through PR detail; create navigates to the list, update navigates to detail.
- PR create returns 204 and navigates to the list.
- `SupplierDetailPage` renders the same editable `UpdateSupplierForm` as the update route; only `suppliers:read` is required to open it, `suppliers:update` is enforced by BE on save.
- Dead mapping: `update-purchase-quotation.api.ts` maps `purchase_quotation.error.not_draft`, absent in BE (BE returns `invalid_status_transition`, E118), so users see the generic message.
- No BE-only routes for these features (all 57 BE routes have a server fn; `getPurchaseOrders` and `getPurchaseOrdersByQuotation` share `GET /purchase-orders`).
- Other consumers: directs, inventory-directs, iqc, outsourcing-receipts, supplier-returns (supplier options); inventory-receipts (purchase-orders options).
