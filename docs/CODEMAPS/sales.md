<!-- Generated: 2026-10-26 | Files scanned: 214 | Token estimate: ~3600 -->
# Sales codemap (web)

Scope: FE features `orders`, `outbound-orders`, `clients` (+ client-groups call), `countries`. BE twin: `be-quanlysanxuat/docs/CODEMAPS/sales.md`; screens and button labels: `docs/ui-flow.md`. Permission gate source: `src/lib/route-permissions.ts`, enforced once in `src/routes/(authed)/route.tsx` (redirect to `/manage`); in-page `PermissionGate` / `RoutePermissionGate` only hide buttons, BE is the real check.

## 1. Features

| Feature folder | Role | Screens (pages/) | Types & status labels | Schemas |
|---|---|---|---|---|
| `src/features/orders` | Sales order (SO) CRUD, approval, exports | OrdersPage, CreateOrderPage, OrderDetailPage, UpdateOrderPage | `src/lib/types/order.type.ts`: `OrderStatus` DRAFT "Nháp", PENDING_CONFIRMATION "Chờ xác nhận", REJECTED "Từ chối", AWAITING_PRODUCTION "Chờ sản xuất", IN_PROGRESS "Đang thực hiện", COMPLETED "Hoàn thành", CANCELLED "Đã hủy"; derived "Trễ hạn"; item NORMAL/CANCELLED | create-order, order-item-form, orders-search, reject-order, update-order |
| `src/features/outbound-orders` | Delivery order (DO) lifecycle | OutboundOrdersPage, CreateOutboundOrderPage, OutboundOrderDetailPage | `outbound-order.type.ts` (+ `outboundOrderInvoiceStatusLabels` NOT_ISSUED "Chưa xuất", ISSUED "Đã xuất"): DRAFT "Nháp", PENDING_APPROVAL "Chờ duyệt", PENDING_DELIVERY "Chờ xuất kho", DELIVERED "Đã giao", CANCELLED "Đã hủy", REJECTED "Bị từ chối" | create-outbound-order, outbound-order-detail-search, outbound-orders-search, outbound-order-stats-search, reject-outbound-order, update-outbound-order, update-outbound-order-invoice |
| `src/features/clients` | Customer master data | ClientsPage, CreateClientPage, UpdateClientPage | `client.type.ts`: ACTIVE "Hoạt động", PAUSED "Tạm ngưng"; `ClientGroupRef`, `ClientRef` | client-contact, clients-search, create-client, update-client |
| `src/features/countries` | api-only (country options, key `["countries","options"]`, staleTime 5 min) | none | `CountryRef` lives in `supplier.type.ts` | none |

Client groups have no feature: `getClientGroups` sits in `clients/api` and feeds the group select.

## 2. Screens

| UI route | Route file (`src/routes/(authed)/`) | Page | Loader preloads | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/manage/clients` | `manage_/clients/index.tsx` | ClientsPage | clientsQueryOptions(search), clientGroupOptionsQueryOptions | clients:read | sidebar |
| `/manage/clients/create` | `manage_/clients_/create/index.tsx` | CreateClientPage | clientGroupOptions | clients:create | "Tạo khách hàng" |
| `/manage/clients/$clientId/update` | `manage_/clients_/$clientId.update.tsx` | UpdateClientPage | clientQueryOptions, clientGroupOptions | clients:update | row "Chỉnh sửa" |
| `/manage/orders` | `manage_/orders/index.tsx` | OrdersPage | ordersQueryOptions (awaited), orderStatsQueryOptions (non-blocking `void ... .catch`) | orders:read | sidebar |
| `/manage/orders/create` | `manage_/orders_/create.tsx` | CreateOrderPage | none | orders:create | "Tạo đơn hàng" |
| `/manage/orders/$orderId` | `manage_/orders_/$orderId.tsx` | OrderDetailPage | orderQueryOptions, orderItemsQueryOptions | orders:read | row eye icon, create success |
| `/manage/orders/$orderId/update` | `manage_/orders_/$orderId_.update.tsx` | UpdateOrderPage | same as detail; loader redirects to detail when `!canUpdateOrder(status)` | orders:update | "Chỉnh sửa" |
| `/manage/outbound-orders` | `manage_/outbound-orders/index.tsx` | OutboundOrdersPage (+ `OutboundOrderStatCards`, tiles also read `outboundOrderStatsQueryOptions`) | outboundOrdersQueryOptions | outbound:read | sidebar |
| `/manage/outbound-orders/create` | `manage_/outbound-orders_/create.tsx` | CreateOutboundOrderPage | none | outbound:create | "Tạo DO mới" |
| `/manage/outbound-orders/$outboundOrderId` | `manage_/outbound-orders_/$outboundOrderId.tsx` | OutboundOrderDetailPage (`?mode=edit\|view`) | outboundOrderQueryOptions, outboundOrderItemsQueryOptions | outbound:read | row "Xem chi tiết DO" |

No client detail route and no outbound-orders `/update` route (edit is `?mode=edit` on detail, page falls back to view when status is not DRAFT). Layout titles: "Danh sách khách hàng", "Đơn hàng (Sales Order)", "Danh sách giao hàng (DO)".

## 3. Actions -> endpoints

Server fn files are `src/features/<feature>/api/server-functions/<name>.api.ts`. BE paths `src/api/<domain>/<domain>.controller.ts:<line>`; `/api` prefix omitted.

### clients (+ client-groups, countries)
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| Create form submit | create-client | POST /clients | clients:create | ClientsController.createClient (clients:89) |
| Row "Xóa" (DeleteClientDialog) | delete-client | DELETE /clients/:clientId | clients:delete | deleteClient (clients:115) |
| Group select | get-client-groups | GET /client-groups (`limit:100`) | public | ClientGroupsController.getClientGroups (client-groups:21) |
| Client pickers (orders, DO, products, directs...) | get-client-options | GET /clients/options | clients:read | getClientOptions (clients:54) |
| Update route loader | get-client | GET /clients/:clientId | clients:read | getClient (clients:66) |
| List page | get-clients | GET /clients | clients:read | getClients (clients:41) |
| Update form submit | update-client | PATCH /clients/:clientId | clients:update | updateClient (clients:102) |
| Country selects (suppliers forms) | get-countries (feature `countries`) | GET /countries | public | CountriesController.getCountries (countries:20) |

### orders
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| "Duyệt" (ApproveOrderDialog) | approve-order | POST /orders/:orderId/approve | orders:approve | approveOrder (orders:168) |
| "Tạo đơn hàng" submit | create-order | POST /orders | orders:create | createOrder (orders:140) |
| "Xoá" (DeleteOrderDialog) | delete-order | DELETE /orders/:orderId | orders:delete | deleteOrder (orders:196) |
| "In" / "Biểu mẫu đơn hàng (BM-01/KD)" | export-order-pdf | GET /orders/:orderId/export-pdf | orders:read | exportOrderPdf (orders:114) |
| Bulk "Danh sách đơn hàng" (Excel) | export-orders-excel | GET /orders/export-excel | orders:read | exportOrdersExcel (orders:68) |
| Bulk "Biểu mẫu đơn hàng (BM-03/KD)" | export-orders-summary-pdf | GET /orders/export-summary-pdf | orders:read | exportOrdersSummaryPdf (orders:91) |
| Detail lines | get-order-items | GET /orders/:orderId/items | orders:read | getOrderItems (orders:127) |
| List stat cards | get-order-stats | GET /orders/stats | orders:read | getOrderStats (orders:58) |
| Detail / update loader | get-order | GET /orders/:orderId | orders:read | getOrder (orders:104) |
| List page | get-orders | GET /orders | orders:read | getOrders (orders:44) |
| "Từ chối" (RejectOrderDialog, body `{reason}`) | reject-order | POST /orders/:orderId/reject | orders:approve | rejectOrder (orders:182) |
| "Gửi duyệt" (body `{status: PENDING_CONFIRMATION}`) | req-order-approval | PATCH /orders/:orderId | orders:update | updateOrder (orders:154) |
| Update form submit | update-order | PATCH /orders/:orderId | orders:update | updateOrder (orders:154) |

### outbound-orders
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| "Duyệt" | approve-outbound-order | POST /outbound-orders/:outboundOrderId/approve | outbound:approve | approveOutboundOrder (outbound-orders:155) |
| "Hủy đơn DO" (CancelDialog) | cancel-outbound-order | POST .../:outboundOrderId/cancel | outbound:update | cancelOutboundOrder (:190) |
| Create wizard confirm | create-outbound-order | POST /outbound-orders | outbound:create | createOutboundOrder (:112) |
| "Xóa DO" (DeleteOutboundOrderDialog) | delete-outbound-order | DELETE .../:outboundOrderId | outbound:delete | deleteOutboundOrder (:203) |
| "Xuất Excel" | export-outbound-orders | GET /outbound-orders/export | outbound:read | exportOutboundOrders (:74) |
| Detail lines | get-outbound-order-items | GET .../:outboundOrderId/items | outbound:read | getOutboundOrderItems (:99) |
| Detail / edit loader | get-outbound-order | GET .../:outboundOrderId | outbound:read | getOutboundOrder (:86) |
| List page | get-outbound-orders | GET /outbound-orders | outbound:read | getOutboundOrders (:48) |
| Stat tiles "Tổng DO" / "DO chưa xuất hóa đơn" (`OutboundOrderStatCards`; second tile sets `status=DELIVERED` + `invoiceStatus=NOT_ISSUED`) | get-outbound-order-stats | GET /outbound-orders/stats | outbound:read | getOutboundOrderStats (:62) |
| "Cập nhật hóa đơn" (`OutboundOrderInvoiceCard` -> `OutboundOrderInvoiceDialog`, DELIVERED only, `PermissionGate outbound:invoice`) | update-outbound-order-invoice | PATCH .../:outboundOrderId/invoice | outbound:invoice | updateOutboundOrderInvoice (:214) |
| Create picker, "Thêm từ PO/Job" | get-unfulfilled-order-items | GET /outbound-orders/unfulfilled-order-items | outbound:read | getUnfulfilledOrderItems (:59) |
| "Từ chối" (body `{reason}`) | reject-outbound-order | POST .../:outboundOrderId/reject | outbound:approve | rejectOutboundOrder (:178) |
| "Gửi duyệt DO" (SendDialog) | send-outbound-order | POST .../:outboundOrderId/send | outbound:update | sendOutboundOrder (:145) |
| `?mode=edit` save | update-outbound-order | PATCH .../:outboundOrderId | outbound:update | updateOutboundOrder (:128) |

## 4. UI state flow

Order (BE rules: BE codemap sales.md, orders state flow):
```
DRAFT|REJECTED --"Gửi duyệt" req-order-approval--> PENDING_CONFIRMATION
PENDING_CONFIRMATION --"Duyệt" approve-order--> AWAITING_PRODUCTION --> IN_PROGRESS --> COMPLETED (BE-driven)
PENDING_CONFIRMATION --"Từ chối" reject-order--> REJECTED --edit without status--> DRAFT
any editable --status select in update form (update-order)--> CANCELLED
```
- "Gửi duyệt": DRAFT or REJECTED, `orders:update`. "Từ chối" + "Duyệt": PENDING_CONFIRMATION, `orders:approve`.
- "Chỉnh sửa": only when `canUpdateOrder(status)` (false for PENDING_CONFIRMATION, AWAITING_PRODUCTION, IN_PROGRESS, COMPLETED, CANCELLED), else disabled with hint. "Xoá": DRAFT or REJECTED, `orders:delete`.
- CANCELLED has no own button: only via the status select, whose options are the current status plus CANCELLED (`buildStatusOptions` in UpdateOrderInfoSection; BE `ensureStatusTransitionAllowed` rejects other targets with E075). UpdateOrderForm seeds DRAFT when the order is REJECTED.
- Approve invalidates `["orders"]`, `["production-orders"]`, `["reports"]`.

Outbound order:
```
DRAFT --"Gửi duyệt DO" send--> PENDING_APPROVAL --"Duyệt" approve (BE creates a DRAFT SALES issue)--> PENDING_DELIVERY "Chờ xuất kho" --warehouse "Xuất kho" on that issue (inventory-issues)--> DELIVERED
DRAFT|REJECTED --send--> PENDING_APPROVAL ; PENDING_APPROVAL --"Từ chối" reject--> REJECTED
DRAFT|PENDING_APPROVAL|PENDING_DELIVERY --"Hủy đơn DO" cancel--> CANCELLED ; DRAFT --"Xóa DO"--> deleted
```
- "Sửa" (`?mode=edit`) and row "Chỉnh sửa DO": DRAFT only, `outbound:update`. "Xóa DO": DRAFT, `outbound:delete`. "Gửi duyệt DO": DRAFT or REJECTED.
- No deliver button any more: the DO detail card links to its issue (`order.inventoryIssue`). Approve and cancel invalidate outbound-orders, inventory-issues, reports; posting the issue (`PostInventoryIssueDialog`) invalidates outbound-orders, orders, inventory-products. Create navigates to the DO list, not detail.
- BE codes surfaced: not_deliverable E237, not_sendable E239, invalid_approval_state E240, not_cancellable E257, not_deletable E258, not_editable E259, quantity_exceeds_deliverable E194.

## 5. Gaps and quirks

- BE-only routes (no server fn): `GET /api/clients/:clientId/contacts` (clients:read, clients:77; FE reads contacts embedded in getClient) and `GET /api/orders/export` (orders:80, alias; FE uses `/export-excel`).
- `getOrders` renames `orderDateFrom/To` to `startDate/endDate`, which BE filters on dueDate (unverified whether intended).
- `getClientOptions` swallows errors and returns `[]`; `get-exchange-rate` is not BE: it calls `https://open.er-api.com` directly (null on failure) for non-VND currency in Create/UpdateOrderInfoSection.
- Dead or wrong mappings: `get-orders.api.ts` maps `order.error.invalid_date_range`, absent in BE. `approve-outbound-order.api.ts` maps `outbound_order.error.oqc_not_completed` (E205), but BE runs the OQC gate in send only (`ensureAllJobsQcCompleted`), approve runs `ensureOutboundLinesIssuable` (E194). FE comments in `order.type.ts` (`canUpdateOrder`) say PENDING_CONFIRMATION edit is "front-end only"; BE `ensureOrderEditable` throws E090 (`order.error.locked_pending_confirmation`) and FE has no mapping for it (generic message).
- Placeholders: clients row "Xem chi tiết" and "Thao tác khác" have no handler; "In phiếu DO" and "In danh sách" are PendingAction (disabled). "Lưu nháp" in the order wizard is localStorage only (`qlsx:draft:create-order-v3`).
- `OrderDetailDeliveryHistoryCard` imports `features/orders/mock/order-detail.mock.ts` but OrderDetailPage does not render it (dead component; ui-flow.md F9 "Lịch sử giao hàng" is stale).
- DO create button label: list "Tạo DO mới", wizard title "Tạo phiếu giao hàng" (ui-flow.md uses the latter).
- Cross-feature consumers of the clients barrel: orders pickers, outbound-orders CreateOutboundOrderForm (default delivery info via `select-default-delivery-info.ts`), products, directs, suppliers filter, ncrs, inventory-receipts. `orderQueryOptions` is also preloaded by production-orders detail.
- Client delete maps `client.error.in_use` to "Khách hàng đang được sử dụng ở đơn hàng, không thể xoá."; update sends the full contacts array (BE replaces all).
