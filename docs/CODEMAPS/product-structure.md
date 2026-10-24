<!-- Generated: 2026-10-24 | Files scanned: ~210 | Token estimate: ~5000 -->
# Product-structure codemap (web)
Items (FG products and DIRECT materials), BOM tree, routing and BOM operations, operation catalog, units. BE twin: `be-quanlysanxuat/docs/CODEMAPS/product-structure.md` (sections 2 Routes, 3 Data model and flows, 4 Key rules and error codes). Screens and button labels: `docs/ui-flow.md`.
Server fns: `src/features/<feature>/api/server-functions/<name>.api.ts`; query factories in `api/options/`. Server fns carry no permission; BE controllers do. BE paths are relative to `be-quanlysanxuat/`.

## 1. Features
There is no `src/features/items/`: the BE `items` table is split on the FE by a hard-coded `type`. `products` always sends `type=FG` (list, export, create); `directs` always sends `type=DIRECT`.
| Feature folder (src/features/) | Role | Screens (pages/) | Types & status labels (src/lib/types/) | Schemas |
|---|---|---|---|---|
| products | FG list/create/detail; BOM tree, routing, BOM-node detail, "issues" rollup | ProductsPage, CreateProductPage, ProductDetailPage, BomItemDetailPage | `item.type.ts`: ItemStatus ACTIVE "Đang sử dụng", INACTIVE "Ngừng sử dụng"; ItemType FG "Thành phẩm"; `bom-item.type.ts`: BomItemType COMPONENT/DIRECT, `isOffStructure` | create/update product, copy, create/update bom-item, create/update product-operation, search x3 |
| directs | DIRECT material master data: list, create, edit, status toggle, copy, Excel import/export | DirectsPage, CreateDirectPage, UpdateDirectPage, ImportDirectsPage | `direct.type.ts` (import field/preview types), status via `ItemStatus` | create/update, copy, update-status, import-direct-row, search |
| operations | Production-operation catalog and its assigned workers | OperationsPage, OperationDetailPage | `operation.type.ts`: OperationStatus ACTIVE "Đang dùng", INACTIVE "Ngừng dùng"; OperationType INHOUSE "Nội bộ", OUTSOURCE "Gia công ngoài" (the catalog row holds a default that pre-fills the type when the operation is attached to a product or BOM item; each attachment keeps its own `type`) | create/update, set-assignments, search |
| units | Unit-of-measure catalog (reference data) | UnitsPage | `unit.type.ts`: UnitType QUANTITY "Số lượng", WEIGHT "Khối lượng", LENGTH "Chiều dài", VOLUME "Thể tích"; UnitStatus ACTIVE/INACTIVE | create/update, search |

## 2. Screens
Permission gate = entry in `src/lib/route-permissions.ts` (checked in `(authed)` beforeLoad). Route files under `src/routes/(authed)/manage_/`.
| UI route (URL) | Route file | Page component | Loader preloads (options) | Permission gate | Reached from |
|---|---|---|---|---|---|
| /manage/products | products/index.tsx | ProductsPage | itemsQueryOptions, clientOptionsQueryOptions | items:read | Sidebar "Sản phẩm" |
| /manage/products/create | products_/create/index.tsx | CreateProductPage | unitOptionsQueryOptions | items:create | list "Thêm sản phẩm" |
| /manage/products/$productId?tab=info\|boms\|directs | products_/$productId.tsx | ProductDetailPage | itemQueryOptions, unitOptionsQueryOptions | items:read | list row; IQC/OQC/Job/supplier-return/stock detail also preload `itemQueryOptions` |
| /manage/products/$productId/bom/$bomItemId?tab= | products_/$productId_/bom/$bomItemId.tsx | BomItemDetailPage | itemBomQueryOptions, bomItemOperationsQueryOptions, itemQueryOptions, unitOptionsQueryOptions | items:read | BOM tree row on product detail tab "Cấu trúc & Công đoạn" |
| /manage/directs | directs/index.tsx | DirectsPage | directsQueryOptions, clientsQueryOptions | items:read | Sidebar "Vật tư" |
| /manage/directs/create | directs_/create/index.tsx | CreateDirectPage | supplierOptionsQueryOptions, unitOptionsQueryOptions | items:create | list menu "Tạo vật tư mới" |
| /manage/directs/import | directs_/import/index.tsx | ImportDirectsPage | none | items:create | list menu "Nhập từ Excel" |
| /manage/directs/$directId/update | directs_/$directId.update.tsx | UpdateDirectPage | directQueryOptions, supplierOptionsQueryOptions, unitOptionsQueryOptions | items:update | list row "Chỉnh sửa" |
| /manage/settings/units | settings/units.tsx | UnitsPage | unitsQueryOptions | items:read (units reuse `items:*`, no `units:*`) | Sidebar "Đơn vị tính" |
| /manage/settings/operations | settings/operations.tsx | OperationsPage | operationsQueryOptions | operations:read | Sidebar "Công đoạn sản xuất" |
| /manage/operations/$operationId | operations_/$operationId.tsx | OperationDetailPage | operationQueryOptions | operations:read | settings/operations row |
| /manage/settings | settings/route.tsx (+index.tsx) | SettingsLayout | currentPermissionsQueryOptions, operationsQueryOptions, unitsQueryOptions | null (children gate themselves); index redirects to units, or operations if only operations:read | direct URL |
| /manage/units, /manage/operations | units/index.tsx, operations/index.tsx | redirect to /manage/settings/units, /manage/settings/operations | none | none | old links |

## 3. Actions -> endpoints
All paths prefixed `/api`. BE file paths below are `src/api/<domain>/<domain>.controller.ts:<line>`; "FE gate" = `PermissionGate`/`RoutePermissionGate` on the trigger.
### products (BE codemap section 2 Routes: items, boms, bom-operations, routings, bom-directs)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getItems | GET /items (type=FG) | items:read | getItems (items:51) |
| Combobox options (consumed by inventory-receipts item pickers) | getItemOptions | GET /items/options | items:read | getItemOptions (items:64) |
| "Xuất Excel" | exportItems | GET /items/export (type=FG) | items:read | exportItems (items:77) |
| Detail (loader) | getItem | GET /items/:itemId | items:read | getItem (items:125) |
| Create form (then navigates to list) | createItem | POST /items | items:create | createItem (items:135) |
| Detail tab "Thông tin sản phẩm" save (FE gate items:update) | updateItem | PATCH /items/:itemId | items:update | updateItem (items:148) |
| Detail header delete (FE gate items:delete; navigates to list) and list row | deleteItem | DELETE /items/:itemId | items:delete | deleteItem (items:176) |
| List row copy dialog (FE gate items:copy) | copyItem | POST /items/:itemId/copy | items:copy | copyItem (items:187) |
| Detail tab "Thành phần vật tư" (ProductIssuesTab: DIRECT requirement rollup per root item) | getItemIssues | GET /items/:itemId/issues | items:read | getItemIssues (items:163) |
| Detail tab "Cấu trúc & Công đoạn": tree | getItemBom | GET /items/:itemId/bom | items:read | getBomItem (boms:34) |
| BOM tree "Thêm" > add part / add direct(s) (FE gate items:bom-manage); body carries `rootItemId`, `type` COMPONENT or DIRECT | createBomItem | POST /items/:itemId/bom/items | items:bom-manage | createItem (boms:45) |
| BOM node edit | updateBomItem | PATCH /items/:itemId/bom/items/:bomItemId | items:bom-manage | updateItem (boms:59) |
| BOM tree "Xoá vật tư" / delete part | deleteBomItem | DELETE /items/:itemId/bom/items/:bomItemId | items:bom-manage | deleteItem (boms:73) |
| Level 0 (root) operations on BOM tab | getRoutingOperations | GET /items/:itemId/operations | items:read | getOperations (routings:38) |
| Add root operation | createRoutingOperation | POST /items/:itemId/operations | items:bom-manage | createOperation (routings:52) |
| Edit / move up-down root operation (sort-order swap = one PATCH per step) | updateRoutingOperation | PATCH /items/:itemId/operations/:stepId | items:bom-manage | updateOperation (routings:66) |
| Delete root operation | deleteRoutingOperation | DELETE /items/:itemId/operations/:stepId | items:bom-manage | deleteOperation (routings:80) |
| BOM-node detail, operations tab (loader) | getBomOperations | GET /items/:itemId/bom/items/:bomItemId/operations | items:read | getOperations (bom-operations:38) |
| Add node operation | createBomOperation | POST /items/:itemId/bom/items/:bomItemId/operations | items:bom-manage | createOperation (bom-operations:57) |
| Edit / move node operation | updateBomOperation | PATCH /items/:itemId/bom/items/:bomItemId/operations/:stepId | items:bom-manage | updateOperation (bom-operations:77) |
| Delete node operation | deleteBomOperation | DELETE /items/:itemId/bom/items/:bomItemId/operations/:stepId | items:bom-manage | deleteOperation (bom-operations:97) |
| BOM-node detail, materials table (BomItemDirectsTable) | getBomDirects | GET /items/:itemId/bom/items/:bomItemId/directs | items:read | getDirects (bom-directs:24) |
### directs (calls the same `items` routes with type=DIRECT)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader; also BOM DirectsPickerTable via barrel) | getDirects | GET /items (type=DIRECT) | items:read | getItems (items:51) |
| Update page (loader) | getDirect | GET /items/:itemId | items:read | getItem (items:125) |
| "Tạo vật tư mới" form | createDirect | POST /items (type=DIRECT) | items:create | createItem (items:135) |
| Update form save | updateDirect | PATCH /items/:itemId | items:update | updateItem (items:148) |
| Row "Ngừng sử dụng" / "Kích hoạt lại" (ToggleDirectStatusDialog; FE gate items:update) | updateDirectStatus | PATCH /items/:itemId | items:update | updateItem (items:148) |
| Row "Sao chép" (FE gate items:copy) | copyDirect | POST /items/:itemId/copy | items:copy | copyItem (items:187) |
| "Xuất Excel" | exportDirects | GET /items/export (type=DIRECT) | items:read | exportItems (items:77) |
| Import page: template download | downloadDirectImportTemplate | GET /items/import-template | items:create | downloadImportTemplate (items:87) |
| Import page: confirm import (multipart) | importDirects | POST /items/import | items:create | importItems (items:112) |
| Import page: preview (parsed locally with exceljs) | previewImportDirects | none (no BE call) | n/a | n/a |
### operations (BE codemap section 2 Routes: operations)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) | getOperations | GET /operations | operations:read | getOperations (operations:43) |
| Picker options (hook `useGetOperationOptions`) | getOperationOptions | GET /operations/options | operations:read | getOperationOptions (operations:57) |
| Detail (loader) | getOperation | GET /operations/:operationId | operations:read | getOperation (operations:69) |
| Detail assignments table | getOperationAssignments | GET /operations/:operationId/assignments | operations:read | getOperationAssignments (operations:83) |
| Assign dialog preselection, header | getOperationAssignmentIds | GET /operations/:operationId/assignments/ids | operations:read | getOperationAssignmentIds (operations:98) |
| "Tạo công đoạn" (FE gate operations:create) | createOperation | POST /operations | operations:create | createOperation (operations:110) |
| Detail header save (FE gate operations:update) | updateOperation | PATCH /operations/:operationId | operations:update | updateOperation (operations:123) |
| Assign dialog save; RemoveOperationAssignmentDialog (FE gate operations:update) | setOperationAssignments | PUT /operations/:operationId/assignments | operations:update | setOperationAssignments (operations:137) |
| List row delete (FE gate operations:delete) | deleteOperation | DELETE /operations/:operationId | operations:delete | deleteOperation (operations:151) |
### units (BE codemap section 2 Routes: units)
| Action / trigger | Server fn | Endpoint | Permission | BE Controller.method (file:line) |
|---|---|---|---|---|
| List (loader) and options (`unitOptionsQueryOptions`) | getUnits | GET /units | public (no `@Permissions`) | getUnits (units:33) |
| Single unit | getUnit | GET /units/:unitId | public | getUnit (units:42) |
| "Thêm đơn vị tính" (FE gate items:create) | createUnit | POST /units | items:create | createUnit (units:52) |
| Row edit (FE gate items:update) | updateUnit | PATCH /units/:unitId | items:update | updateUnit (units:62) |
| Row delete (FE gate items:update) | deleteUnit | DELETE /units/:unitId | items:update | deleteUnit (units:76) |

Rows above: 46 (45 call a BE route, 38 distinct routes; `previewImportDirects` has none).

## 4. UI state flow
- Item/Direct/Unit/Operation status ACTIVE <-> INACTIVE: only `directs` has a one-click toggle (row "Ngừng sử dụng" / "Kích hoạt lại" -> `updateDirectStatus`, title "Ngừng sử dụng vật tư này?" / "Kích hoạt lại vật tư này?"). Products, units and operations change status through their normal edit form (`updateItem`, `updateUnit`, `updateOperation`).
- BOM build-up (see BE codemap section 3 for the node model: Level 0 root operations + `bom_items` COMPONENT/DIRECT nodes + node operations):
  create product (`createItem`) -> detail tab "Cấu trúc & Công đoạn" -> root operations (`createRoutingOperation`) and nodes (`createBomItem`) -> open node (`/bom/$bomItemId`) -> node operations (`createBomOperation`) and node materials (read-only `getBomDirects`).
- Order of operations is a `sortOrder` integer; move up/down swaps two steps with parallel PATCHes (`updateRoutingOperation` for Level 0, `updateBomOperation` for a node).
- Cache keys: BOM and operation mutations invalidate `["items"]`; units `["units"]`; operation catalog `["operations"]`.
- Product detail is a form with 3 tabs (`?tab=`): "info" saves with the header "Lưu" (`updateItem`); BOM tab actions write immediately ("Thay đổi ở tab này được lưu ngay").

## 5. Gaps and quirks
- item-units: the 4 BE routes `GET|POST /api/items/:itemId/units` and `PATCH|DELETE /api/items/:itemId/units/:unitId` (item-units.controller.ts:32/42/54/68) have no FE caller. Verified: no `item-units` feature folder, no type, no reference to `/units` under an item anywhere in `src/`. Units are only the global catalog plus a single `unit` per item/BOM line.
- `directs` has no delete and no detail page (edit page only); `DELETE /items/:itemId` is reachable only from `products`.
- `getUnit` (`unitQueryOptions`) is defined but no consumer was found outside `api/`. Unit GET routes are public on the BE while the screens gate on `items:read`.
- `updateDirect` and `updateDirectStatus` share `PATCH /items/:itemId`; `copyItem` and `copyDirect` share `POST /items/:itemId/copy`; `exportItems`/`exportDirects` share `GET /items/export` (differ by the hard-coded `type`).
- Naming mismatch (BE side, not a bug): boms/bom-operations/routings controllers name every handler `createItem`/`updateItem`/`deleteItem`/`createOperation`/...; the BE codemap lists the service names (e.g. `createBomItem`). `GET .../directs` is controller `getDirects`, service `getBomDirects`.
- "Issues" (`getItemIssues`, type `ItemIssue`) means rolled-up DIRECT requirements per root item (`requiredQty`), not stock issues (`inventory-issues`). The product detail tab with value `directs` is labeled "Thành phần vật tư" and renders `ProductIssuesTab`.
- `docs/ui-flow.md` is stale on: `/manage/units` and `/manage/operations` are redirects to `/manage/settings/units|operations`; product detail tab value is `directs`, not `materials`.
- `createBomItem` is called once per selected material (`Promise.all`), so a partial failure leaves some nodes created; the hook invalidates `["items"]` in `onSettled`.
- Unverified: exact sidebar label strings for "Vật tư"/"Sản phẩm" groups beyond the leaf labels above; consumers of `getItemOptions` beyond inventory-receipts item pickers; `?tab=` values of the BOM-node detail route.
