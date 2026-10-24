<!-- Generated: 2026-10-24 | Files scanned: ~120 | Token estimate: ~5000 -->
# Production codemap (web)

Production orders (LSX), production jobs (JOB), shop-floor execution, outsourcing OS-OUT and OS-IN. BE twin: `be-quanlysanxuat/docs/CODEMAPS/production.md` (sections 1 Modules, 2 Routes, 3 State flows, 4 Key rules, 5 Cross-domain links). Screen and button map: `docs/ui-flow.md`. Quality-side screens (OQC request, NCR): `docs/CODEMAPS/quality.md`.

Server fns live in `src/features/<feature>/api/server-functions/<name>.api.ts`. FE does not check permissions in server fns; the gates below are route gates (`src/lib/route-permissions.ts`, enforced in `src/routes/(authed)/route.tsx`) and button gates (`PermissionGate`, `RoutePermissionGate`); BE enforces the real permission in the controller.

## 1. Features
| Feature folder | Role | Screens (pages/) | Types and status labels | Schemas |
|---|---|---|---|---|
| `production-orders` | LSX list, edit lines, approve, signed file, PDF/Excel | `ProductionOrdersPage`, `ProductionOrderDetailPage` | `production-order.type.ts` (`ProductionOrderStatus`) | production-orders-search, update-production-order, update-production-order-signed-file |
| `production-jobs` | JOB list/detail: plan, BOM issues, operations, notes, OQC request | `ProductionJobsPage`, `ProductionJobDetailPage` | `production-job.type.ts` (`ProductionJobStatus`, operation progress, warnings) | production-jobs-search, production-job-detail-search (`tab`), create-production-job-issues, update-production-job-issue, create-production-job-note |
| `production-execution` | Shop-floor view of operations per job; reads only (report is written by a production-jobs server fn) | `ProductionExecutionPage`, `ProductionExecutionJobPage` | `production-job.type.ts` (execution types) | production-execution-search (`operationId`, `all`), production-execution-job-search |
| `outsourcing-orders` | OS-OUT: send operations to a supplier | `OutsourcingOrdersPage`, `OutsourcingOrderDetailPage`, `CreateOutsourcingOrderPage` | `outsourcing-order.type.ts` (`OutsourcingOrderStatus`) | create-outsourcing-order, create-outsourcing-order-search (`productionJobId`, `operationId`), outsourcing-orders-search |
| `outsourcing-receipts` | OS-IN: receive goods back, optional IQC | `OutsourcingReceiptsPage`, `OutsourcingReceiptDetailPage`, `CreateOutsourcingReceiptPage` | `outsourcing-receipt.type.ts` (reuses `InventoryDocumentStatus`) | create-outsourcing-receipt, outsourcing-receipts-search |

## 2. Screens
Permission gate = `routePermissions` entry (read unless noted). Sidebar labels from `AppSidebar.tsx`.
| UI route (URL) | Route file (`src/routes/(authed)/`) | Page component | Loader preloads (options) | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/manage/production-orders` | `manage_/production-orders/index.tsx` | `ProductionOrdersPage` | productionOrdersQueryOptions | `production:read` | Sidebar "Lệnh sản xuất (LSX)"; NCR "Tạo LSX từ NCR" links to `/manage/ncrs?status=APPROVED` |
| `/manage/production-orders/$productionOrderId` | `manage_/production-orders_/$productionOrderId.tsx` | `ProductionOrderDetailPage` | orderQueryOptions, productionOrderLogsQueryOptions, productionOrderQueryOptions | `production:read` | LSX list row "Sửa LSX"; purchase-requests detail; inventory-requisitions detail; NCR trace card; JOB info tab |
| `/manage/production-jobs` | `manage_/production-jobs/route.tsx` (layout "Quản lý sản xuất") + `index.tsx` | `ProductionJobsPage` | productionJobsQueryOptions, clientsQueryOptions | `production:read` | Sidebar "Quản lý sản xuất" |
| `/manage/production-jobs/$productionJobId?tab=info\|bom\|operations` | `manage_/production-jobs_/$productionJobId.tsx` | `ProductionJobDetailPage` | productionJobQueryOptions, itemQueryOptions | `production:read` | JOB list row "Xem chi tiết"; NCR trace; execution pages |
| `/manage/production-execution` | `manage_/production-execution/index.tsx` | `ProductionExecutionPage` | clientsQueryOptions, productionJobsByOperationQueryOptions (only when `operationId` set), productionExecutionOperationsQueryOptions | `production-execution:read` | Sidebar "Thực hiện sản xuất" |
| `/manage/production-execution/$productionJobId?operationId=` | `manage_/production-execution_/$productionJobId.tsx` | `ProductionExecutionJobPage` | productionExecutionJobOperationsQueryOptions, productionExecutionJobQueryOptions | `production-execution:read` | Execution list row "Xem chi tiết"; missing `operationId` redirects back to the list |
| `/manage/outsourcing-orders` | `manage_/outsourcing-orders/index.tsx` | `OutsourcingOrdersPage` | outsourcingOrdersQueryOptions | `outsourcing:read` | Sidebar "Xuất đi gia công (OS-OUT)" |
| `/manage/outsourcing-orders/create` | `manage_/outsourcing-orders_/create.tsx` | `CreateOutsourcingOrderPage` | none (queries run in component) | `outsourcing:create` | List "Tạo phiếu gia công ngoài (OS-OUT)"; JOB operations tab and execution parts "Gửi gia công ngoài" (`?productionJobId&operationId`) |
| `/manage/outsourcing-orders/$outsourcingOrderId` | `manage_/outsourcing-orders_/$outsourcingOrderId.tsx` | `OutsourcingOrderDetailPage` | outsourcingOrderItemsQueryOptions, outsourcingOrderQueryOptions | `outsourcing:read` | OS-OUT list row |
| `/manage/outsourcing-receipts` | `manage_/outsourcing-receipts/index.tsx` | `OutsourcingReceiptsPage` | outsourcingReceiptsQueryOptions, supplierOptionsQueryOptions | `outsourcing:read` | Sidebar "Nhập về (OS-IN)" |
| `/manage/outsourcing-receipts/create` | `manage_/outsourcing-receipts_/create.tsx` | `CreateOutsourcingReceiptPage` | none | `outsourcing:create` | List "Lập phiếu OS-IN" |
| `/manage/outsourcing-receipts/$outsourcingReceiptId` | `manage_/outsourcing-receipts_/$outsourcingReceiptId.tsx` | `OutsourcingReceiptDetailPage` | outsourcingReceiptItemsQueryOptions, outsourcingReceiptQueryOptions | `outsourcing:read` | OS-IN list row |

## 3. Actions -> endpoints
Server fn file = kebab-case of the fn name + `.api.ts`. BE column is the handler method line in `be-quanlysanxuat/src/api/<feature>/<feature>.controller.ts` (feature = the group title; same line convention as BE production.md). The `createJobOperationReport` row is the exception: it lives in `src/api/production-execution/production-execution.controller.ts`.

### production-orders (8)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| LSX list, filters | `getProductionOrders` | GET /api/production-orders | production:read | :45 (`getProductionOrders`) |
| List "Xuất Excel" | `exportProductionOrders` | GET /api/production-orders/export | production:read | :59 |
| Detail load | `getProductionOrder` | GET /api/production-orders/:productionOrdersId | production:read | :71 (`getProductionOrdersById`) |
| Detail "In" / "Xuất" -> "Biểu mẫu lệnh sản xuất" | `exportProductionOrderPdf` | GET /api/production-orders/:productionOrdersId/export-pdf | production:read | :85 |
| Detail "Lưu thay đổi" (PENDING only; sends changed lines) | `updateProductionOrder` | PATCH /api/production-orders/:productionOrdersId | production:update | :100 |
| Signed-file card "Chọn tệp" / "Thay thế" / "Xóa" (upload first via `src/lib/upload-file.ts`, `UploadType.PRODUCTION_ORDER_SIGNED_DOCUMENT`) | `updateProductionOrderSignedFile` | PATCH /api/production-orders/:productionOrdersId/signed-file | production:update | :136 |
| Detail logs panel | `getProductionOrderLogs` | GET /api/production-orders/:productionOrdersId/logs | production:read | :155 |
| Detail "Duyệt LSX" -> `ApproveProductionOrderDialog` | `approveProductionOrder` | POST /api/production-orders/:productionOrdersId/approve | production:approve | :171 |

### production-jobs (19)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| JOB list | `getProductionJobs` | GET /api/production-jobs | production:read | :60 (`getProductionJobs`) |
| Pickers (OS-OUT create, inventory-receipts header, inventory-requisitions source); default status IN_PROGRESS | `getProductionJobOptions` | GET /api/production-jobs | production:read | :60 (same handler as above) |
| List "Xuất" -> "Biểu mẫu kế hoạch sản xuất (N Job)" (selected jobs, same client; `jobIds=a,b`) | `exportProductionJobsPlanPdf` | GET /api/production-jobs/export-plan-pdf | production:read | :73 (`exportProductionPlanPdf`) |
| JOB detail load | `getProductionJob` | GET /api/production-jobs/:jobId | production:read | :85 |
| BOM tab list | `getProductionJobBom` | GET /api/production-jobs/:jobId/bom | production:read | :98 |
| Operations tab list | `getProductionJobOperations` | GET /api/production-jobs/:jobId/operations | production:read | :116 |
| Notes section list | `getProductionJobNotes` | GET /api/production-jobs/:jobId/notes | production:read | :139 |
| Notes "Gửi ghi chú" | `createProductionJobNote` | POST /api/production-jobs/:jobId/notes | production:update | :167 (`createProductionJobNote`) |
| Logs panel | `getProductionJobLogs` | GET /api/production-jobs/:jobId/logs | production:read | :154 |
| BOM tab "Thêm vật tư" | `createProductionJobIssues` | POST /api/production-jobs/:jobId/bom | production:update | :186 (`addIssues`) |
| BOM tab inline quantity cell | `updateProductionJobIssue` | PATCH /api/production-jobs/:jobId/bom/:issueId | production:update | :200 (`updateIssue`) |
| BOM tab row "Xoá vật tư" | `deleteProductionJobIssue` | DELETE /api/production-jobs/:jobId/bom/:issueId | production:update | :220 (`removeIssue`) |
| Header "Tải lại" -> `ReloadProductionJobSnapshotDialog` | `reloadProductionJobSnapshot` | POST /api/production-jobs/:jobId/snapshot | production:update | :239 (`reloadSnapshot`) |
| Header "Xác nhận kế hoạch" -> `StartProductionJobDialog` "Xác nhận" | `startProductionJob` | POST /api/production-jobs/:jobId/start | production:update | :250 (`startJob`) |
| Header "Lập kế hoạch" dialog open (plan group ops) | `getProductionJobPlanGroupOperations` | GET /api/production-jobs/:jobId/operations/plan | production:read | :265 (`getProductionJobPlanOperations`) |
| Header "Lập kế hoạch" -> `PlanProductionJobDialog` save | `updateProductionJobPlan` | PATCH /api/production-jobs/:jobId/operations/plan | production:update | :278 (`updateProductionJobOperationsPlan`) |
| Operations tab due-date cell | `updateJobOperationDueDate` | PATCH /api/production-jobs/:jobId/operations/:jobOperationId/due-date | production:update | :295 (`updateProductionJobOperationDueDate`) |
| Header "Yêu cầu OQC" (qty field) -> creates OQC DRAFT | `requestProductionJobQc` | POST /api/production-jobs/:jobId/qc | oqc:create | :315 (`requestJobQc`) |
| Operations tab "Nhập báo cáo"; execution parts "Cập nhật" (shared `JobOperationReportDialog`) | `createJobOperationReport` | POST /api/production-execution/operations/:jobOperationId/reports | production-execution:report | src/api/production-execution/production-execution.controller.ts:125 |

### production-execution (5)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| Operation tiles on list | `getProductionExecutionOperations` | GET /api/production-execution/operations | production-execution:read | :37 (`getOperations`) |
| Jobs for chosen operation | `getProductionJobsByOperation` | GET /api/production-execution/jobs | production-execution:read | :52 (`getJobs`) |
| Job page header | `getProductionExecutionJob` | GET /api/production-execution/jobs/:productionJobId | production-execution:read | :66 (`getJob`) |
| Job page "parts" tab | `getProductionExecutionJobOperations` | GET /api/production-execution/jobs/:productionJobId/operations | production-execution:read | :86 (`getJobOperations`) |
| Job page "reports" tab ("Lịch sử báo cáo") | `getJobOperationReports` | GET /api/production-execution/jobs/:productionJobId/reports | production-execution:read | :106 |

### outsourcing-orders (6)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| OS-OUT list | `getOutsourcingOrders` | GET /api/outsourcing-orders | outsourcing:read | :35 |
| Create wizard picker; execution parts (only when JOB IN_PROGRESS and user has `outsourcing:read`) | `getOutsourceableOperations` | GET /api/outsourcing-orders/outsourceable-operations | outsourcing:read | :49 |
| Detail header | `getOutsourcingOrder` | GET /api/outsourcing-orders/:outsourcingOrderId | outsourcing:read | :67 |
| Detail lines | `getOutsourcingOrderItems` | GET /api/outsourcing-orders/:outsourcingOrderId/items | outsourcing:read | :82 (`getOrderItems`) |
| Create wizard "Xác nhận tạo phiếu" (tab "3. Xác nhận & tạo phiếu"), then back to list | `createOutsourcingOrder` | POST /api/outsourcing-orders | outsourcing:create | :95 |
| Detail "Hủy phiếu" | `cancelOutsourcingOrder` | POST /api/outsourcing-orders/:outsourcingOrderId/cancel | outsourcing:update | :111 |

### outsourcing-receipts (6)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| OS-IN list | `getOutsourcingReceipts` | GET /api/outsourcing-receipts | outsourcing:read | :33 |
| Create wizard picker of open OS-OUT lines | `getPendingOrderItems` | GET /api/outsourcing-receipts/pending-order-items | outsourcing:read | :47 |
| Detail header | `getOutsourcingReceipt` | GET /api/outsourcing-receipts/:outsourcingReceiptId | outsourcing:read | :59 |
| Detail lines | `getOutsourcingReceiptItems` | GET /api/outsourcing-receipts/:outsourcingReceiptId/items | outsourcing:read | :74 (`getReceiptItems`) |
| Create wizard "Xác nhận nhập" (step 2 switch "Yêu cầu QC" = `requiresIqc`), then back to list | `createOutsourcingReceipt` | POST /api/outsourcing-receipts | outsourcing:create | :89 |
| Detail "Hủy phiếu" | `cancelOutsourcingReceipt` | POST /api/outsourcing-receipts/:outsourcingReceiptId/cancel | outsourcing:update | :105 |

## 4. UI state flow
LSX (`ProductionOrderStatus`: PENDING "Chờ duyệt", APPROVED "Đã duyệt", COMPLETED "Hoàn thành")
- PENDING: "Lưu thay đổi" (`updateProductionOrder`, disabled without edits) and "Duyệt LSX" (`approveProductionOrder`, `production:approve`, disabled with tooltip "Vui lòng lưu thay đổi trước khi duyệt LSX" while unsaved). Approve -> APPROVED (BE creates JOBs) or straight to COMPLETED when every line qty is 0 (BE production.md section 3).
- APPROVED -> COMPLETED has no button: BE closes it when all sibling JOBs complete. No "Hủy LSX" button or endpoint.
- Approve invalidates production-orders, orders, production-jobs, reports.

JOB (`ProductionJobStatus`: PENDING "Chưa SX", IN_PROGRESS "Đang SX", WAITING_QC "Chờ QC", WAITING_DELIVERY "Chờ giao hàng", COMPLETED "Hoàn thành")
```
PENDING --"Xác nhận kế hoạch" (startProductionJob, one-way)--> IN_PROGRESS
PENDING only: "Tải lại" (reload snapshot), BOM tab "Thêm vật tư" / qty cell / "Xoá vật tư"
IN_PROGRESS only: "Lập kế hoạch" (updateProductionJobPlan), due-date cell, "Nhập báo cáo" (createJobOperationReport)
IN_PROGRESS -> WAITING_QC: BE only (all FG ops done, closeJobIfFinalAssemblyDone, BE production.md section 3)
IN_PROGRESS|WAITING_QC: "Yêu cầu OQC" (requestProductionJobQc, enabled when oqcRequestableQuantity > 0) -> new OQC DRAFT
WAITING_QC -> WAITING_DELIVERY -> COMPLETED: BE only (closeJobIfQcCovered, closeJobIfFullyReceived)
```
- Header buttons are wrapped in `PermissionGate production:update` ("Tải lại", "Xác nhận kế hoạch", "Lập kế hoạch") and `oqc:create` ("Yêu cầu OQC").
- "Nhập báo cáo" is disabled for: JOB PENDING, JOB not IN_PROGRESS, OUTSOURCE operation type, assembly blocked.
- OUTSOURCE operation rows show "Gửi gia công ngoài" (link to OS-OUT create with `productionJobId`, `operationId`), disabled "Đã gửi đủ định mức" when fully sent.
- "Lãnh vật tư cho Job" link to `/manage/inventory-requisitions/create`: disabled while PENDING, hidden when `ncrAction === REWORK`.
- NCR marker: a JOB whose LSX has `ncrAction` shows a red "(sửa chữa)"/"(làm mới)" (`formatNcrJobMarker`, `src/lib/types/ncr.type.ts`) under the PO in the JOB list, the execution list and the JOB detail header, and the list rows get a red left edge (inset shadow on the first cell). The plan PDF prints the same marker.
- Execution screen: "Cập nhật" per part (`production-execution:report`). Report form: "✓ SL đạt" capped at planned minus completed, NG uncapped, note, images (uploaded as `UploadType.PRODUCTION_OPERATION_EVIDENCE`). Invalidates production-execution and production-jobs.

OS-OUT (`OutsourcingOrderStatus`: SENT "Đang gia công", PARTIAL "Về 1 phần", WAITING_QC "Chờ QC", COMPLETED "Hoàn thành", CANCELLED "Đã hủy")
- Create -> SENT. PARTIAL / WAITING_QC / COMPLETED are recomputed by BE from OS-IN and IQC (BE production.md section 3). The only FE-driven move is "Hủy phiếu" -> CANCELLED (hidden when already CANCELLED). "In phiếu" is disabled.

OS-IN (`InventoryDocumentStatus`, labels "Chờ nhận" DRAFT / "Đã nhận" POSTED / "Đã huỷ" CANCELLED)
- "Xác nhận nhập" creates it as POSTED (DRAFT is unreachable). "Hủy phiếu" -> CANCELLED (hidden when CANCELLED; BE refuses once an IQC exists, E173).
- Switch "Yêu cầu QC" = Có makes BE create an IQC row per line (outsourcing-receipts.service.ts:398); that IQC is then handled on `/manage/iqc` (see quality.md).

## 5. Gaps and quirks
- BE `PATCH /api/production-orders/:productionOrdersId/note` (`production:update`, `updateProductionOrderNote`, production-orders.controller.ts:118) has no FE caller. Verified by grep: no server fn, no UI. `productionOrderNote` exists only as a read-only field in `production-order.type.ts:46` and is never rendered.
- `getProductionJobs` and `getProductionJobOptions` call the same BE route and handler; the second is a barrel hook used by other features.
- "Tạo LSX" on the LSX list is a disabled placeholder ("Màn hình tạo LSX sắp có"); LSX creation is BE-side only (order approve, NCR secondary LSX).
- JOB list row action "Chỉnh sửa" is disabled ("chưa được xây dựng").
- Row "Xoá vật tư" has no FE `PermissionGate`; BE enforces `production:update`.
- "Nhập báo cáo" trigger on the JOB operations tab is gated `production:update`, while the form needs `production-execution:report` (fallback alert "Bạn không có quyền nhập báo cáo hoàn thành công đoạn.").
- Signed-file buttons are gated `production:update` with no status condition in FE; whether BE restricts by LSX status is unverified.
- `ui-flow.md` wording differs from code: JOB start button is "Xác nhận kế hoạch" (not "Bắt đầu SX"); OS-IN list button is "Lập phiếu OS-IN" (not "Tạo"); execution "Xem chi tiết" has no IN_PROGRESS-only restriction.
- Stale FE comment in `create-outsourcing-receipt.api.ts` says the receipt is created DRAFT; BE and type comments say POSTED immediately.
- Both create wizards navigate to the list after submit, not to the new document's detail.
- Whether a secondary REWORK/REMAKE JOB goes through OQC before its receipt is not special-cased in FE (header "Yêu cầu OQC" ignores `ncrAction`); the BE codemap also lists it as unverified.
