<!-- Generated: 2026-10-16 | Files scanned: ~75 | Token estimate: ~4500 -->
# Quality codemap (web)

IQC (incoming), OQC (outgoing) and NCR (non-conformance), including the OQC Fail -> Sort -> NCR -> secondary LSX -> re-OQC flow seen from the UI. BE twin: `be-quanlysanxuat/docs/CODEMAPS/quality.md` (sections 1 Modules, 2 Routes, 3 State flows incl. "PH-136 flow", 4 Key rules, 5 Cross-domain links). Screen and button map: `docs/ui-flow.md`. Job and LSX screens: `docs/CODEMAPS/production.md`.

Server fns live in `src/features/<feature>/api/server-functions/<name>.api.ts`; file = kebab-case of the fn name + `.api.ts`. FE server fns do not check permissions: gates below are route gates (`src/lib/route-permissions.ts`) and button gates (`PermissionGate`); BE enforces the real one.

## 1. Features
| Feature folder | Role | Screens (pages/) | Types and status labels | Schemas |
|---|---|---|---|---|
| `iqc` | Incoming inspection: list, stats, confirm result and disposition (no create) | `IqcPage`, `IqcDetailPage` | `iqc.type.ts` (`IqcStatus`, `IqcResult`, `IqcDisposition`) | iqc-search, confirm-iqc |
| `oqc` | Outgoing inspection of a JOB lot: list, confirm, delete DRAFT (no create) | `OqcPage`, `OqcDetailPage` | `oqc.type.ts` (`OqcStatus`, `OqcDisposition`) | oqc-search, confirm-oqc |
| `ncrs` | NCR: manual create, analysis, approval, secondary LSX, re-OQC, cost lines | `NcrsPage`, `NcrDetailPage`, `NcrCreatePage` | `ncr.type.ts` (`NcrStatus`, `NcrType`, `NcrOriginType`, `NcrProductionAction`) | ncrs-search, create-ncr, update-ncr, reject-ncr, request-ncr-oqc, save-ncr-cost-lines |

## 2. Screens
| UI route (URL) | Route file (`src/routes/(authed)/`) | Page component | Loader preloads (options) | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/manage/iqc` | `manage_/iqc/index.tsx` | `IqcPage` | iqcStatsQueryOptions, iqcsQueryOptions, supplierOptionsQueryOptions | `iqc:read` | Sidebar "IQC" |
| `/manage/iqc/$iqcId` | `manage_/iqc_/$iqcId.tsx` | `IqcDetailPage` | departmentQueryOptions, iqcQueryOptions, itemQueryOptions | `iqc:read` | IQC list row |
| `/manage/oqc` | `manage_/oqc/index.tsx` | `OqcPage` | oqcsQueryOptions | `oqc:read` | Sidebar "OQC" |
| `/manage/oqc/$oqcId` | `manage_/oqc_/$oqcId.tsx` | `OqcDetailPage` | oqcQueryOptions, itemQueryOptions | `oqc:read` | OQC list row; NCR trace card "OQC lại" rows |
| `/manage/ncrs` | `manage_/ncrs/index.tsx` | `NcrsPage` | ncrsQueryOptions | `ncr:read` | Sidebar "NCR"; LSX list "Tạo LSX từ NCR" (`?status=APPROVED`) |
| `/manage/ncrs/create` | `manage_/ncrs_/create.tsx` | `NcrCreatePage` | none | `ncr:create` | NCR list "Tạo NCR"; dashboard quick action |
| `/manage/ncrs/$ncrId` | `manage_/ncrs_/$ncrId.tsx` | `NcrDetailPage` | ncrQueryOptions | `ncr:read` | NCR list row; OQC lot summary `spawnedNcrs` / `ncr` links |

## 3. Actions -> endpoints
BE column is the handler method line in `be-quanlysanxuat/src/api/<feature>/<feature>.controller.ts` (feature = group title). BE quality.md cites the route-decorator line instead, about 3-8 lines earlier (e.g. confirmOqc :67 there vs :74 here).

### iqc (5)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| List table, filters | `getIqcs` | GET /api/iqc | iqc:read | :43 |
| List stat cards | `getIqcStats` | GET /api/iqc/stats | iqc:read | :57 |
| List "Xuất Excel" | `exportIqc` | GET /api/iqc/export | iqc:read | :69 |
| Detail load | `getIqc` | GET /api/iqc/:iqcId | iqc:read | :79 |
| Detail "Lưu" (result PASS/FAIL, disposition when FAIL) | `confirmIqc` | POST /api/iqc/:iqcId/confirm | iqc:update | :104 |

### oqc (5)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| List table, filters | `getOqcs` | GET /api/oqc | oqc:read | :39 |
| List "Xuất Excel" | `exportOqc` | GET /api/oqc/export | oqc:read | :53 |
| Detail load | `getOqc` | GET /api/oqc/:oqcId | oqc:read | :63 |
| Detail "Lưu" (result, disposition, SORT qty split) | `confirmOqc` | POST /api/oqc/:oqcId/confirm | oqc:update | :74 |
| Detail or list row "Xoá phiếu" (DRAFT only) | `deleteOqc` | DELETE /api/oqc/:oqcId | oqc:delete | :88 |

### ncrs (13)
| Action / screen trigger | Server fn | Endpoint | Permission | BE line |
|---|---|---|---|---|
| List table, filters | `getNcrs` | GET /api/ncrs | ncr:read | :39 |
| Create form "NCR-NB (nội bộ)" / "NCR-KH (khách hàng)" | `createNcr` | POST /api/ncrs | ncr:create | :51 |
| Detail load | `getNcr` | GET /api/ncrs/:ncrId | ncr:read | :61 |
| Analysis form rework-operation picker (`NcrReworkOperationsPicker`) | `getNcrOperations` | GET /api/ncrs/:ncrId/operations | ncr:read | :71 |
| Analysis form "Lưu phân tích" (OPEN or REJECTED only) | `updateNcr` | PATCH /api/ncrs/:ncrId | ncr:update | :83 |
| "Gửi duyệt" | `submitNcr` | POST /api/ncrs/:ncrId/submit | ncr:update | :97 |
| "Duyệt" | `approveNcr` | POST /api/ncrs/:ncrId/approve | ncr:approve | :107 |
| "Không duyệt" -> `RejectNcrDialog` (field "Lý do không duyệt") | `rejectNcr` | POST /api/ncrs/:ncrId/reject | ncr:approve | :120 |
| "Đóng NCR" (only when rework+remake qty = 0) | `closeNcr` | POST /api/ncrs/:ncrId/close | ncr:update | :134 |
| "Tạo LSX sửa chữa" / "Tạo LSX làm mới" (`action` REWORK / REMAKE) | `createNcrProductionOrder` | POST /api/ncrs/:ncrId/production-order | ncr:update | :147 (`createProductionOrder`) |
| "Không tạo LSX" (toast "NCR chuyển sang chờ OQC lại") | `skipNcrProductionOrder` | POST /api/ncrs/:ncrId/skip-production-order | ncr:update | :165 (`completeWithoutProductionOrder`) |
| "Yêu cầu OQC lại" -> `RequestNcrOqcDialog` (button "Tạo phiếu OQC") | `requestNcrOqc` | POST /api/ncrs/:ncrId/oqc | ncr:update + oqc:create | :181 (`requestOqc`) |
| Cost lines card "Lưu dự toán" | `saveNcrCostLines` | PUT /api/ncrs/:ncrId/cost-lines | ncr:update | :195 (`saveCostLines`) |

## 4. UI state flow
IQC (`IqcStatus`: DRAFT "Chưa kiểm", PENDING "Chờ xử lý", IN_PROGRESS "Chờ trả NCC", COMPLETED "Hoàn thành", CANCELLED "Đã hủy")
- Rows are never created from the IQC screens. They come from an inventory receipt "Xác nhận & Gửi IQC" (`CreateInventoryReceiptFromPoForm.tsx`) or from the OS-IN wizard switch "Yêu cầu QC" (see production.md); both create the row on the BE.
- Detail "Lưu" (`confirmIqc`, `iqc:update`; hidden when IN_PROGRESS or CANCELLED) moves the row, outcomes per BE quality.md section 3:
```
PASS                      -> COMPLETED
FAIL, no disposition      -> PENDING
FAIL + CONCESSION         -> COMPLETED   ("Chấp nhận đặc biệt")
FAIL + SORT | RETURN      -> IN_PROGRESS (BE creates a DRAFT supplier return; "Phân loại" / "Trả NCC")
IN_PROGRESS -> COMPLETED : posting the supplier return (inventory screen), not an IQC button
```
- Disposition radios appear only when result = FAIL. Cancel comes from cancelling the inventory receipt (BE).
- Flow card labels "PASS → Hoàn thành", "Chấp nhận đặc biệt → Hoàn thành", "Kho xuất trả NCC → Hoàn thành" are diagram nodes (`IqcProcessFlowCard`), not buttons; the real button is "Lưu".
- Invalidates iqc, inventory-receipts, inventory-products, supplier-returns, reports.

OQC (`OqcStatus`: DRAFT "Chờ kiểm", PENDING "FAIL - chờ xử lý", IN_PROGRESS "Đang rework", COMPLETED "Đã QC")
- Created only by JOB "Yêu cầu OQC" (`requestProductionJobQc`, `oqc:create`) or NCR "Yêu cầu OQC lại" (`requestNcrOqc`); starts as DRAFT.
- Detail "Lưu" (`confirmOqc`, `oqc:update`; hidden when COMPLETED; the form can be saved again while PENDING):
```
PASS                                -> COMPLETED
FAIL, no disposition                -> PENDING
FAIL + ACCEPT "Chấp nhận đặc biệt"  -> COMPLETED  (hint "Hoàn thành ngay — không cần kiểm lại.")
FAIL + SORT "Sàng lọc OK/NG"        -> COMPLETED  (field "SL NG (<unit>) — sinh NCR"; OK = lot qty - NG)
REWORK / SCRAP                      : shown only when the lot already holds that value (legacy); new lots offer ACCEPT or SORT only
```
- "Xoá phiếu" (`deleteOqc`, `oqc:delete`) only when DRAFT, then back to `/manage/oqc`. Confirm invalidates oqc, production-jobs, production-execution, ncrs.

NCR (`NcrStatus`: OPEN "Chờ phân tích", PENDING_APPROVAL "Chờ duyệt", APPROVED "Đã duyệt", IN_PROGRESS "Đang xử lý", PENDING_QC "Chờ OQC lại", CLOSED "Đã đóng", REJECTED "Không duyệt")
```
OPEN | REJECTED --"Lưu phân tích" (updateNcr)--> same status
OPEN | REJECTED --"Gửi duyệt" (submitNcr)--> PENDING_APPROVAL
PENDING_APPROVAL --"Duyệt" (approveNcr, ncr:approve)--> APPROVED
PENDING_APPROVAL --"Không duyệt" (rejectNcr + reason)--> REJECTED (edit, resubmit)
APPROVED, rework+remake = 0 --"Đóng NCR" (closeNcr)--> CLOSED
APPROVED | IN_PROGRESS, qty > 0:
   "Tạo LSX sửa chữa" (reworkQty>0, no REWORK LSX yet) / "Tạo LSX làm mới" (remakeQty>0, no REMAKE LSX yet)
        (createNcrProductionOrder) --> IN_PROGRESS, secondary LSX created APPROVED, sourceType NCR
   "Không tạo LSX" (APPROVED only; skipNcrProductionOrder) --> PENDING_QC
IN_PROGRESS --secondary LSX COMPLETED (BE closeNcrIfProductionOrdersDone)--> CLOSED
PENDING_QC --"Yêu cầu OQC lại" (requestNcrOqc; needs ncr.productionJob)--> new OQC DRAFT linked by ncrId, NCR stays PENDING_QC
PENDING_QC --re-OQC confirmed COMPLETED (BE closeNcrAfterOqc)--> CLOSED
```
- `NcrAnalysisForm`: `ngQty` locked when originType = OQC; `reworkQty`/`remakeQty`/`reworkOperationIds` editable; cost lines locked only when CLOSED.
- "Yêu cầu OQC lại" dialog: field "SL kiểm lại" (default and max = reworkQty + remakeQty), submit "Tạo phiếu OQC".
- Each NCR action invalidates ncrs, production-orders, production-jobs, oqc.

### OQC Fail -> Sort -> NCR -> secondary LSX -> re-OQC, UI side
| # | Screen | Trigger (button) | Server fn | Status change |
|---|---|---|---|---|
| 1 | `/manage/production-jobs/$productionJobId` header | "Yêu cầu OQC" (JOB IN_PROGRESS or WAITING_QC, qty field "Số lượng lô OQC (tối đa N)") | `requestProductionJobQc` | new OQC DRAFT |
| 2 | `/manage/oqc/$oqcId` | result FAIL, disposition "Sàng lọc OK/NG", "SL NG" > 0, "Lưu" | `confirmOqc` | OQC DRAFT -> COMPLETED; BE spawns NCR-NB (OPEN, originType OQC, ngQty = SL NG), OK part goes to receipt |
| 3 | `/manage/ncrs/$ncrId` | "Lưu phân tích", then "Gửi duyệt" | `updateNcr`, `submitNcr` | OPEN -> PENDING_APPROVAL |
| 4 | `/manage/ncrs/$ncrId` | "Duyệt" (or "Không duyệt" -> REJECTED -> fix -> "Gửi duyệt") | `approveNcr` / `rejectNcr` | PENDING_APPROVAL -> APPROVED / REJECTED |
| 5a | `/manage/ncrs/$ncrId` | "Tạo LSX sửa chữa" / "Tạo LSX làm mới" | `createNcrProductionOrder` | NCR -> IN_PROGRESS; secondary LSX APPROVED with 1 JOB; link "Nguồn" "NCR {code}" on the LSX detail |
| 5b | `/manage/ncrs/$ncrId` | "Không tạo LSX" | `skipNcrProductionOrder` | NCR -> PENDING_QC |
| 6 | `/manage/production-jobs/$productionJobId` (secondary JOB) | same JOB buttons as above ("Xác nhận kế hoạch", "Nhập báo cáo"); REWORK JOB hides "Lãnh vật tư cho Job" | production-jobs fns | JOB PENDING -> ... ; on LSX COMPLETED the BE closes the NCR |
| 7 | `/manage/ncrs/$ncrId` | "Yêu cầu OQC lại" (only at PENDING_QC) | `requestNcrOqc` | new OQC DRAFT with `ncrId`; shown in OQC lot summary as link `ncr` |
| 8 | `/manage/oqc/$oqcId` (the re-OQC) | "Lưu" with PASS or FAIL + ACCEPT/SORT | `confirmOqc` | OQC COMPLETED -> NCR PENDING_QC -> CLOSED; a SORT with NG left spawns a child NCR (`parentNcrId`) |
Trace: `NcrTraceCard` links source OQC, parent NCR, secondary LSX (`/manage/production-orders/$id`), "OQC lại" rows and child NCRs; `OqcLotSummaryCard` shows `ncr` and `spawnedNcrs`.

## 5. Gaps and quirks
- BE `POST /api/iqc` (`createIqc`, iqc.controller.ts:89), `PATCH /api/iqc/:iqcId` (:119) and `DELETE /api/iqc/:iqcId` (:132) have no FE caller. Verified: no server fn, `/api/iqc` appears only in the five matched fns. "Thêm IQC" is a disabled placeholder ("Tính năng tạo phiếu IQC sắp có"); IQC rows are created by BE flows from inventory receipt confirm and OS-IN `requiresIqc` (BE quality.md section 3). No IQC delete or edit button exists.
- Other disabled placeholders: IQC "In phiếu", `IqcStatusLegend` "Xuất trả NCC →" (when no linked supplier return).
- OQC has no create route; NCR create is manual only (NCR-NB / NCR-KH), the OQC-origin NCR is BE-generated.
- UI reaches NCR PENDING_QC only through "Không tạo LSX"; BE `requestOqc` also accepts APPROVED, which the UI never offers. After an LSX path the NCR is closed by the BE on LSX completion, so a re-OQC is only requested on the "no LSX" branch.
- "Yêu cầu OQC lại" also needs `ncr.productionJob`; otherwise the button is not shown (BE E311).
- FE cannot pick OQC disposition SCRAP or REWORK for a new lot, consistent with the BE legacy note.
- `ui-flow.md` wording differs from code: OQC detail button is "Lưu" (not "Xác nhận kết quả"); IQC result nodes are flow labels, not buttons.
- Stale FE comments mention `WAITING_RETURN` / `NOT_INSPECTED` (IqcDetailActions, IqcDetailForm, OqcDetailActions); the enums are IN_PROGRESS / DRAFT.
- Unverified: whether the output of a secondary REWORK/REMAKE JOB passes OQC before its receipt (FE does not special-case `ncrAction` on "Yêu cầu OQC"; BE codemap lists it as unverified); BE write bodies were not re-read.
