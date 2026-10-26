<!-- Generated: 2026-10-26 | Files scanned: ~190 | Token estimate: ~4800 -->
# Inventory codemap (web)
Receipts (PNK), issues (PXK), material requisitions, supplier returns, stock screens. BE twin: `be-quanlysanxuat/docs/CODEMAPS/inventory.md` (sections 2 Routes, 3 State flows, 4 Key rules). Screens and button labels: `docs/ui-flow.md` (see section 5 for stale parts).
Server fns: `src/features/<feature>/api/server-functions/<name>.api.ts`; query factories in `api/options/`. No server fn checks permissions; the BE controller does. BE paths are relative to `be-quanlysanxuat/`.

## 1. Features
| Feature folder (src/features/) | Role | Screens (pages/) | Types & status labels (src/lib/types/) | Schemas |
|---|---|---|---|---|
| inventory-receipts | Receipt list, detail, 3-lane create, edit DRAFT | InventoryReceiptsPage, InventoryReceiptDetailPage, CreateInventoryReceiptReceiptPage, UpdateInventoryReceiptPage | `inventory-receipt.type.ts`: status DRAFT "Nháp", PENDING_RECEIPT "Chờ nhập kho", PENDING_IQC "Chờ IQC", IQC_COMPLETED "Đã xong IQC", POSTED "Đã nhập kho", CANCELLED "Đã huỷ"; type PURCHASE/PRODUCTION/RETURN/OTHER | create (generic, -from-po, -return, -other, lane-search), update, item-form, search |
| inventory-issues | Issue (PXK) list and detail, post/cancel; finished-goods list pinned to SALES | InventoryIssuesPage, FinishedGoodsIssuesPage, InventoryIssueDetailPage | `inventory-issue.type.ts`: DRAFT "Nháp", POSTED "Đã xuất kho", CANCELLED "Đã huỷ"; type PRODUCTION/SALES/RETURN | search only |
| inventory-requisitions | Material requisition ("Phiếu lãnh vật tư") with approval | InventoryRequisitionsPage, InventoryRequisitionDetailPage, InventoryRequisitionCreatePage | `inventory-requisition.type.ts`: DRAFT "Nháp", PENDING_APPROVAL "Chờ duyệt", APPROVED "Đã duyệt", ISSUED "Đã xuất", REJECTED "Từ chối", CANCELLED "Đã hủy"; type PRODUCTION/OTHER | create, reject, search |
| inventory-adjustments | Orphan: schemas only, no api/pages/components | none | `inventory-adjustment.type.ts` (DRAFT/POSTED "Đã ghi sổ"/CANCELLED) | 4 unused zod schemas |
| inventory-products | Finished-goods stock list, per-item detail, ledger tab | InventoryProductsPage, InventoryProductDetailPage | `inventory-product.type.ts`, `product-ledger.type.ts` (movement labels derived on FE, e.g. "Nhập từ sản xuất", "Giao hàng (DO)", "Đảo bút toán (huỷ phiếu)") | search, detail-search |
| inventory-directs | Material (DIRECT) stock list | InventoryDirectsPage | `inventory-direct.type.ts`: NORMAL "Bình thường", WARNING "Cảnh báo", SHORTAGE "Thiếu" (computed from available vs minStock) | search |
| supplier-returns | Return-to-supplier list/detail, post, edit reason | SupplierReturnsPage, SupplierReturnDetailPage | `supplier-return.type.ts`: DRAFT "Chờ xuất", POSTED "Đã xuất", CANCELLED "Đã huỷ" | post, update, search |

## 2. Screens
Permission gate = entry in `src/lib/route-permissions.ts` (checked in `(authed)` beforeLoad); no route file has its own beforeLoad.
| UI route (URL) | Route file (src/routes/(authed)/manage_/) | Page component | Loader preloads (options) | Permission gate | Reached from |
|---|---|---|---|---|---|
| /manage/inventory-receipts | inventory-receipts/index.tsx | InventoryReceiptsPage | inventoryReceiptsQueryOptions | inventory:read | Sidebar "Nhập kho" (todo badge) |
| /manage/inventory-receipts/$inventoryReceiptId | inventory-receipts_/$inventoryReceiptId.tsx | InventoryReceiptDetailPage | inventoryReceiptQueryOptions | inventory:read | list row "Xem chi tiết" |
| /manage/inventory-receipts/$inventoryReceiptId/update | inventory-receipts_/$inventoryReceiptId_.update.tsx | UpdateInventoryReceiptPage | inventoryReceiptQueryOptions | inventory:update | list row "Chỉnh sửa" (DRAFT only) |
| /manage/inventory-receipts/create-receipt?lane=po\|return\|other | inventory-receipts_/create-receipt.tsx | CreateInventoryReceiptReceiptPage | none | inventory:create | list "Tạo phiếu nhập"; ManageQuickActions |
| /manage/inventory-issues | inventory-issues/index.tsx | InventoryIssuesPage | inventoryIssuesQueryOptions | inventory:read | Sidebar "Xuất kho" (todo badge) |
| /manage/finished-goods-issues | finished-goods-issues/index.tsx | FinishedGoodsIssuesPage (same table/filter as above, `issueType=SALES` fixed) | inventoryIssuesQueryOptions | inventory:read | Sidebar "Xuất kho thành phẩm" (todo badge `salesIssuesToPost`) |
| /manage/inventory-issues/$issueId | inventory-issues_/$issueId.tsx | InventoryIssueDetailPage | inventoryIssueQueryOptions | inventory:read | list "Xem chi tiết"; requisition detail "Phiếu xuất kho" |
| /manage/inventory-requisitions | inventory-requisitions/index.tsx | InventoryRequisitionsPage | inventoryRequisitionsQueryOptions | inventory-requisitions:read | Sidebar "Phiếu lãnh vật tư" (badge) |
| /manage/inventory-requisitions/$requisitionId | inventory-requisitions_/$requisitionId.tsx | InventoryRequisitionDetailPage | inventoryRequisitionQueryOptions | inventory-requisitions:read | list row |
| /manage/inventory-requisitions/create?type=PRODUCTION\|OTHER&productionJobId= | inventory-requisitions_/create.tsx | InventoryRequisitionCreatePage | none | inventory-requisitions:create | list "+ Lãnh từ LSX" / "+ Lãnh khác"; Job BOM tab (production-jobs/ProductionJobBomTab.tsx) |
| /manage/inventory-products | inventory-products/index.tsx | InventoryProductsPage | inventoryProductsQueryOptions | inventory:read | Sidebar "Tồn kho thành phẩm" |
| /manage/inventory-products/$itemId | inventory-products_/$itemId.tsx | InventoryProductDetailPage | itemInventoryQueryOptions, itemQueryOptions (products) | inventory:read (comment: read-only viewer must reach it) | list row |
| /manage/inventory-directs | inventory-directs/index.tsx | InventoryDirectsPage | directInventoryQueryOptions, supplierOptionsQueryOptions | inventory:read | Sidebar "Tồn kho vật tư" |
| /manage/supplier-returns | supplier-returns/index.tsx | SupplierReturnsPage | supplierReturnsQueryOptions, supplierOptionsQueryOptions | inventory:read | Sidebar "Trả NCC" |
| /manage/supplier-returns/$supplierReturnId | supplier-returns_/$supplierReturnId.tsx | SupplierReturnDetailPage | itemQueryOptions, supplierReturnQueryOptions, supplierQueryOptions | inventory:read | list row; IQC detail (iqc/IqcDetailActions.tsx link) |

## 3. Actions -> endpoints
All paths prefixed `/api`. Permission = BE `@Permissions`. "FE gate" in the trigger column is the `PermissionGate` / `RoutePermissionGate` around the button.
### inventory-receipts (BE: inventory-receipts.controller.ts; BE codemap "State flows" receipt)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getInventoryReceipts | GET /inventory-receipts | inventory:read | getInventoryReceipts (src/api/inventory-receipts/inventory-receipts.controller.ts:44) |
| Detail (loader) | getInventoryReceipt | GET /inventory-receipts/:receiptId | inventory:read | getInventoryReceipt (:56) |
| Related notes card on detail | getInventoryReceiptRelatedNotes | GET /inventory-receipts/:receiptId/related-notes | inventory:read | getRelatedNotes (:173) |
| Wizard "Lưu nháp" / "Xác nhận ..." (step 1 of create) | createInventoryReceipt | POST /inventory-receipts | inventory:create | createInventoryReceipt (:69) |
| Edit form (DRAFT) save | updateInventoryReceipt | PATCH /inventory-receipts/:receiptId | inventory:update | updateInventoryReceipt (:85) |
| List row "Xóa phiếu" (DRAFT; FE gate inventory:delete) | deleteInventoryReceipt | DELETE /inventory-receipts/:receiptId | inventory:delete | deleteInventoryReceipt (:101) |
| Detail "Xác nhận" (DRAFT) and wizard step 2 | confirmInventoryReceipt | POST /inventory-receipts/:receiptId/confirm | inventory:update | confirmInventoryReceipt (:114) |
| Detail "Xác nhận nhập kho" (the only place stock is posted from the UI) | postInventoryReceipt | POST /inventory-receipts/:receiptId/post | inventory:update | postInventoryReceipt (:131) |
| Detail "Hủy phiếu" | cancelInventoryReceipt | POST /inventory-receipts/:receiptId/cancel | inventory:update | cancelInventoryReceipt (:148) |
| Detail "Xuất" menu "Phiếu nhập kho" / "File tài liệu PDF" (FE gate inventory:read) | exportInventoryReceiptPdf | GET /inventory-receipts/:receiptId/export-pdf | inventory:read | exportInventoryReceiptPdf (:160) |
### inventory-issues (BE codemap "State flows" issue)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getInventoryIssues | GET /inventory-issues | inventory:read | getInventoryIssues (src/api/inventory-issues/inventory-issues.controller.ts:40) |
| Detail (loader) | getInventoryIssue | GET /inventory-issues/:issueId | inventory:read | getInventoryIssue (:52) |
| Detail "Xuất kho" (DRAFT; FE gate inventory:update; `PostInventoryIssueDialog`: optional note + photos/files, camera on phone, photos >2MB downscaled) | postInventoryIssue | POST /inventory-issues/:issueId/post | inventory:update | postInventoryIssue (:104) |
| Detail "Hủy phiếu" (DRAFT; FE gate also `outbound:update` when the issue has `outboundOrder`, the DO is cancelled too) | cancelInventoryIssue | POST /inventory-issues/:issueId/cancel | inventory:update (+ outbound:update for DO-linked) | cancelInventoryIssue (:121) |
### inventory-requisitions (BE codemap "State flows" requisition)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getInventoryRequisitions | GET /inventory-requisitions | inventory-requisitions:read | getInventoryRequisitions (src/api/inventory-requisitions/inventory-requisitions.controller.ts:45) |
| Create picker (job BOM lines / other items) | getRequisitionLines | GET /inventory-requisitions/lines | inventory-requisitions:read | getRequisitionLines (:62) |
| Detail (loader) | getInventoryRequisition | GET /inventory-requisitions/:requisitionId | inventory-requisitions:read | getInventoryRequisition (:74) |
| Create form submit | createInventoryRequisition | POST /inventory-requisitions | inventory-requisitions:create | createInventoryRequisition (:88) |
| Edit lines on detail (DRAFT/REJECTED; useHasPermission update) | updateInventoryRequisition | PATCH /inventory-requisitions/:requisitionId | inventory-requisitions:update | updateInventoryRequisition (:105) |
| Detail "Xoá phiếu" (DRAFT) | deleteInventoryRequisition | DELETE /inventory-requisitions/:requisitionId | inventory-requisitions:delete | deleteInventoryRequisition (:121) |
| Detail "Gửi duyệt" / "Gửi duyệt lại" | sendInventoryRequisition | POST /inventory-requisitions/:requisitionId/send | inventory-requisitions:update | sendInventoryRequisition (:135) |
| Detail "Duyệt" | approveInventoryRequisition | POST /inventory-requisitions/:requisitionId/approve | inventory-requisitions:approve | approveInventoryRequisition (:153) |
| Detail "Từ chối" (reason dialog) | rejectInventoryRequisition | POST /inventory-requisitions/:requisitionId/reject | inventory-requisitions:approve | rejectInventoryRequisition (:169) |
### supplier-returns (BE codemap "State flows" supplier return)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getSupplierReturns | GET /supplier-returns | inventory:read | getSupplierReturns (src/api/supplier-returns/supplier-returns.controller.ts:39) |
| Detail (loader) | getSupplierReturn | GET /supplier-returns/:supplierReturnId | inventory:read | getSupplierReturn (:51) |
| Detail return-reason field (toast "Đã cập nhật lý do trả hàng") | updateSupplierReturn | PATCH /supplier-returns/:supplierReturnId | inventory:update | updateSupplierReturn (:64) |
| Detail "Xác nhận xuất" (DRAFT; FE gate inventory:update; optional note + attachments) | postSupplierReturn | POST /supplier-returns/:supplierReturnId/post | inventory:update | postSupplierReturn (:82) |
### inventory-products and inventory-directs
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| FG stock list (loader) | getProductInventory | GET /inventory-products | inventory:read | getInventoryProducts (src/api/inventory-products/inventory-products.controller.ts:28) |
| FG detail stat tiles (loader) | getItemInventory | GET /inventory-products | inventory:read | getInventoryProducts (:28), same route as above, filtered by item |
| Detail "ledger" tab | getProductLedger | GET /inventory-products/:itemId/ledger | inventory:read | getProductLedger (:42) |
| Material stock list (loader) | getDirectInventory | GET /inventory-directs | inventory:read | getInventoryDirects (src/api/inventory-directs/inventory-directs.controller.ts:25) |

Rows above: 31 (30 distinct BE routes).

## 4. UI state flow
Receipt (`InventoryReceiptDetailActions.tsx`):
- DRAFT --"Xác nhận" (confirm)--> PENDING_IQC if `requiresIqc`, else PENDING_RECEIPT (no stock yet)
- PENDING_RECEIPT | IQC_COMPLETED | PENDING_IQC --"Xác nhận nhập kho" (post)--> POSTED (stock added; BE rejects with E153 while IQC open)
- PENDING_IQC --(BE, last IQC completes)--> IQC_COMPLETED
- any status except POSTED/CANCELLED --"Hủy phiếu" (cancel)--> CANCELLED (linked IQC cancelled too)
- Edit and "Xóa phiếu" visible only in DRAFT (list row cells); query keys invalidated on action: inventory-receipts, inventory-products, iqc, production-orders, production-jobs, purchase-orders, purchase-ledger, payment-requests, reports.
- Wizard (`use-create-inventory-receipt.ts`, Return/Other lanes): create -> DRAFT ("Lưu nháp"); "Xác nhận (Chờ IQC)" or "Xác nhận (Chờ nhập kho)" = create+confirm -> PENDING_IQC / PENDING_RECEIPT. PO lane (`CreateInventoryReceiptFromPoForm.tsx`) does the same. No lane posts: stock goes up only from the detail page "Xác nhận nhập kho" (PH-119). If create succeeds but confirm fails the receipt stays and the user is sent to the list with a toast.
Issue (`InventoryIssueDetailActions.tsx`): DRAFT --"Xuất kho"--> POSTED; DRAFT --"Hủy phiếu"--> CANCELLED. Dialog adds "Phiếu lãnh vật tư liên quan sẽ chuyển sang Đã xuất" when the PXK came from a requisition (invalidates inventory-requisitions).
Requisition (`InventoryRequisitionDetailActions.tsx`):
- DRAFT --"Gửi duyệt"--> PENDING_APPROVAL; REJECTED --"Gửi duyệt lại"--> PENDING_APPROVAL (no re-edit required)
- PENDING_APPROVAL --"Duyệt" (approve; BE generates the PXK)--> APPROVED; --"Từ chối"--> REJECTED
- DRAFT --"Xoá phiếu"--> deleted (navigates to list); APPROVED shows "Phiếu xuất kho" link to the PXK
- APPROVED --(PXK posted via issue detail "Xuất kho")--> ISSUED; --(PXK cancelled)--> CANCELLED; both set by the BE, not by a requisition server fn
- Saving edited lines on a REJECTED requisition: BE returns it to DRAFT (`ensureRequisitionEditable`).
Supplier return: DRAFT "Chờ xuất" --"Xác nhận xuất"--> POSTED "Đã xuất" (stock deducted if the receipt was posted; linked IQC auto-completed per dialog text). No FE create, edit-lines or cancel.
Stock screens are read-only (no actions).

## 5. Gaps and quirks
13 BE routes have no FE caller (verified by reading the feature folders, not mocks):
- inventory-adjustments (7 routes: list, detail, create, patch, delete, post, cancel): no UI at all. `features/inventory-adjustments/` holds 4 orphan zod schemas and `lib/types/inventory-adjustment.type.ts`; no api/pages/components/route, no sidebar entry. `docs/ui-flow.md` F3 already flags this folder as dead code.
- inventory-issues POST/PATCH/DELETE (3): no server fn. PXK are created by the BE on requisition approve or DO approve (DRAFT SALES issue; PATCH/DELETE blocked E319); the UI only lists, views, posts and cancels them.
- inventory-requisitions POST :id/cancel (1): no server fn or button; a requisition becomes CANCELLED only through its PXK cancel.
- GET /inventory/balances and /inventory/transactions (2): no FE caller. FE stock screens use /inventory-products and /inventory-directs instead.
Other quirks:
- `getProductInventory` (list) and `getItemInventory` (detail) hit the same `GET /inventory-products`; they differ only in filters and query key (`["inventory-products","list"|"detail"]`).
- Receipt create route is only `create-receipt?lane=po|return|other` (default `po`); there is no `/create`. The PO is picked inside the PO-lane wizard, not from the PO detail page.
- `ui-flow.md` stale items: `/manage/inventory-issues/$issueId` exists; stock-materials URL is `/manage/inventory-directs` ("Tồn kho vật tư"); requisition create is deep-linked from the Job BOM tab ("Lãnh vật tư cho Job").
- Print: receipt export works; issue, requisition and supplier-return "In"/"In phiếu" are `PendingAction` placeholders.
- Supplier return reason edit has no PermissionGate in `SupplierReturnReasonField.tsx`; the BE enforces inventory:update. Unverified: whether the field is read-only after POSTED.
- Sidebar badge counts (`inventoryRequisitions`, `inventoryReceiptsToPost`, `inventoryIssuesToPost`) come from the reports/integration domain; origin endpoint unverified here.
