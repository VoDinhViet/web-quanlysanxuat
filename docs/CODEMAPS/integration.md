<!-- Generated: 2026-10-19 | Files scanned: 48 | Token estimate: ~3300 -->
# Integration, reports & files codemap (web)

Scope: dashboard `/manage` (features `reports` + `manage`), and the file upload/download plumbing in `src/lib`. BE twin: `be-quanlysanxuat/docs/CODEMAPS/integration.md`. Screens: `docs/ui-flow.md`. Platform view: `architecture.md`.

External-caller note: the 22 BE `/api/v1/integration/*` routes (read-only gateway for the AI platform, `Api-Key` header, optional `X-On-Behalf-Of`) are not called by this app: no server function, no `lib` file and no route references `integration`. They are listed grouped here only: whoami, order/production/purchasing/quality counts and rankings. Likewise `GET /api/health` has no FE caller (the deploy healthchecks hit FE `/login`).

## 1. Features
| Feature folder | Role | Screens (pages/) | Types & status labels | Schemas |
|---|---|---|---|---|
| `reports` | api-only: 7 server fns + query options for the BE `reports` controller | none | `src/lib/types/report.type.ts` (`PendingApprovals`, stats, alerts) | none |
| `manage` | Dashboard UI; no `api/` of its own, reads `reports/api` and `outbound-orders/api` barrels | `ManagePage` | `manage.type.ts`; `production-job.type.ts` status labels for the donut | `manage-search.schema.ts` (`startDate`, `endDate`) |

Files plumbing (no feature): `src/lib/upload-file.ts`, `download-file.ts`, `file-url.ts`, `file-field.schema.ts`, `types/file.type.ts` (`UploadType`, `FileKind`, `FileResource`, size limits, accepted MIME maps).

## 2. Screens
| UI route (URL) | Route file | Page component | Loader preloads (options) | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/manage?startDate=&endDate=` | `src/routes/(authed)/manage.tsx` | `ManagePage` | all `bg`: `reportStats`, `reportAlerts`, `productionProgress`, `upcomingDeliveries` (outbound list), `outsourcingOrderDueDate`, `jobDueDate`, `qcPassRate` | route `null` (redirect target); beforeLoad needs `reports:read` else `firstReadableRoute`; content in `PermissionGate reports:read` | sidebar "Bảng điều khiển" (group "Tổng quan"), `/` redirect, any denied route |

Widgets (each does its own `useQuery`, skeleton + error state, none blocks the page):
| Component | Query | Notes |
|---|---|---|
| `ManageStatCards` (tiles from `constants/report-stats-tiles.ts`), `ManageFooter` (last-fetch time) | `reportStatsQueryOptions()` | no date params from UI |
| `ManageAlerts` | `reportAlertsQueryOptions()` | |
| `ManageProductionChart` donut via `hooks/use-production-progress.ts` | `productionProgressQueryOptions({startDate,endDate})` | `DateRangePicker` writes the `/manage` search; `keepPreviousData` |
| `ManageJobDueDateTable` | `jobDueDateQueryOptions()` | |
| `ManageOutsourcingDueDateTable` | `outsourcingOrderDueDateQueryOptions()` | |
| `ManageUpcomingDeliveriesTable` via `hooks/use-upcoming-deliveries.ts` | `outboundOrdersQueryOptions({status: PENDING_DELIVERY, today..+3 days, limit 50})` | not a report: reuses GET /api/outbound-orders; sorted client-side by `fulfillmentDate` |
| `ManageQcRateChart` | `qcPassRateQueryOptions()` | |
| `ManageQuickActions` | none | links gated by `RoutePermissionGate` |
| Sidebar badges (`AppSidebar`, not on this route) | `pendingApprovalsQueryOptions()` | `refetchInterval` 60 s, runs on every `(authed)` page |

## 3. Actions -> endpoints
**reports** (`src/features/reports/api/server-functions/`)
| Action / screen trigger | Server fn | Endpoint | Permission | BE handler (`src/api/reports/reports.controller.ts`) |
|---|---|---|---|---|
| Stat tiles | `get-report-stats.api.ts` | GET /api/reports/stats | `reports:read` | `getStats` (:31) |
| Alerts card | `get-report-alerts.api.ts` | GET /api/reports/alerts | `reports:read` | `getAlerts` (:42) |
| Job due-date table | `get-job-due-date.api.ts` | GET /api/reports/job-due-date | `reports:read` | `getJobDueDate` (:54) |
| Outsourcing due-date table | `get-outsourcing-order-due-date.api.ts` | GET /api/reports/outsourcing-order-due-date | `reports:read` | `getOutsourcingOrderDueDate` (:66) |
| QC pass-rate chart | `get-qc-pass-rate.api.ts` | GET /api/reports/qc-pass-rate | `reports:read` | `getQcPassRate` (:78) |
| Production donut | `get-production-progress.api.ts` | GET /api/reports/production-progress | `reports:read` | `getProductionProgress` (:89) |
| Sidebar badges (red `badgeKey` = awaiting approval, blue `todoBadgeKey` = work to do, e.g. purchase requests: red `purchaseRequests`, blue `purchaseRequestsToSubmit` = my DRAFT/REJECTED) | `get-pending-approvals.api.ts` | GET /api/reports/pending-approvals | JWT only (BE zeroes counts the caller cannot act on) | `getPendingApprovals` (:101) |

**files** (`src/lib/`, not a feature)
| Action | Code | Endpoint | Permission | BE handler (`src/api/files/files.controller.ts`) |
|---|---|---|---|---|
| Any file picker/dropzone | `uploadFile` server fn, `src/lib/upload-file.ts` | POST /api/files?type= (multipart `file`) | JWT, no permission (any `UploadType`) | `upload` (:28) |
| Excel/PDF export buttons | per-feature export server fns (16 files return base64, e.g. `export-users.api.ts`) -> `downloadBase64File` / `printBase64Pdf` in `download-file.ts` | each domain's own GET export route | see domain codemaps | see domain codemaps |
| Image/attachment links | `resolveFileUrl(url)` in `file-url.ts` | none (static GET `<BE origin>/<storageKey>`) | none | BE `ServeStaticModule` |

### Upload path (UI -> BE -> entity)
```
dropzone (react-dropzone, client check: MAX_IMAGE 5MB / MAX_DOCUMENT 10MB, accepted MIME map)
  -> useMutation -> uploadFile({data: FormData{file, type}})        [server fn, validateUploadFormData]
  -> http.post("/api/files", body, {params:{type}, multipart})      [Bearer attached]
  <- FileResource {id, url, originalName, mimetype, size, type, kind, createdAt}
  -> form state (fileFieldSchema); preview = resolveFileUrl(url)
  -> form submit: only ids go on the wire (resolveApiFileId / resolveApiFileIds, file-field.schema.ts)
  -> BE linkFiles() sets linkedAt; unlinked files are swept after ~24h (hourly cron)
```
`uploadFile` maps BE codes to Vietnamese messages: `upload.error.invalid_file`, `upload.error.file_too_large`, `auth.error.forbidden`. It invalidates no query. Create sends `undefined` (key omitted), update sends `null` to clear a single file (PATCH).

| UploadType (`file.type.ts`) | UI component (feature) | Wire field -> endpoint that attaches it |
|---|---|---|
| USER_AVATAR | `ImageUploader` (users) | `avatarFileId` -> POST /api/users, PATCH /api/users/:userId |
| DIRECT_IMAGE | `DirectImageField` (directs) | `imageFileId` -> POST /api/items, PATCH /api/items/:itemId |
| PRODUCT_IMAGE, ITEM_DOCUMENT | `ProductImageField`, `UploadProductDocuments` (products) | `imageFileId`, `fileIds` -> POST /api/items, PATCH /api/items/:itemId |
| BOM_ITEM_IMAGE | `ProductImageField` (BOM mode), `CreateComponentItemDialog`, `BomItemInfoTab` (products) | `imageFileId` -> POST /api/items/:rootItemId/bom/items, PATCH /api/items/:itemId/bom/items/:bomItemId |
| SUPPLIER_LOGO, SUPPLIER_DOCUMENT | `SupplierLogoField`, `SupplierDocumentsField` (suppliers) | `logoFileId`, `fileIds` -> POST /api/suppliers, PATCH /api/suppliers/:supplierId |
| ORDER_DOCUMENT | `UploadOrderDocuments` (orders) | `fileIds` -> POST /api/orders, PATCH /api/orders/:orderId |
| QUOTATION_SUPPLIER_EVIDENCE | `QuotationSupplierAttachment(+Cell)` (purchase-quotations) | per-supplier `fileIds` -> POST /api/purchase-quotations, PATCH /api/purchase-quotations/:id |
| IQC_EVIDENCE, IQC_DISPOSITION_EVIDENCE | `IqcEvidenceCard` in `IqcDetailForm` (iqc) | `qcEvidenceFileIds`, `dispositionEvidenceFileIds` -> POST /api/iqc/:iqcId/confirm |
| OQC_EVIDENCE, OQC_DISPOSITION_EVIDENCE | `OqcEvidenceCard` in `OqcDetailForm` (oqc) | same names -> POST /api/oqc/:oqcId/confirm |
| PRODUCTION_OPERATION_EVIDENCE | `JobOperationReportEvidenceField` (shared) | `imageFileIds` -> POST /api/production-execution/operations/:jobOperationId/reports |
| SUPPLIER_RETURN_EVIDENCE | `SupplierReturnEvidenceField` (supplier-returns) | `fileIds` -> POST /api/supplier-returns/:supplierReturnId/post |
| PRODUCTION_ORDER_SIGNED_DOCUMENT | `ProductionOrderSignedFileCard` (production-orders) | `signedFileId` -> PATCH /api/production-orders/:id/signed-file |
| PRODUCT_DOCUMENT, BOM_ITEM_DRAWING | retired, kept in the enum only | do not use |
| DIRECT_DOCUMENT | enum value; no upload call site found | unverified |

Downloads: binary BE responses are fetched in server fns with `responseType: "arraybuffer"`, base64'd across the RPC boundary, then `downloadBase64File(base64, filename, mime)` builds a Blob link (`XLSX_MIME_TYPE`, `PDF_MIME_TYPE`); `printBase64Pdf` prints through a hidden iframe. A raw BE URL is never opened because it would lack the Bearer token. Uploaded files are the one exception: `<img src>`/`<a href>` go straight from the browser to the BE origin via `resolveFileUrl` (no-op when `VITE_API_URL` is empty).

## 4. UI state flow
No status enum is owned by this group. Dashboard is read-only; the only mutation-like flow is the date range in the URL: `ManageProductionChart` DateRangePicker -> `navigate({search})` -> `useProductionProgress` re-queries (loader is not re-run: no `loaderDeps`).

## 5. Gaps and quirks
- BE routes with no FE caller: 22 integration routes (external API-key callers), `GET /api/files/:fileId`, `DELETE /api/files/:fileId`, `GET /api/health`. FE never deletes an uploaded file; removing one from a form just drops its id and the BE orphan sweep deletes it.
- `reports` has no UI of its own; its only non-dashboard consumer is the sidebar badge poll (`AppSidebar`), which runs on every authed page.
- "Upcoming deliveries" is built from the outbound-orders list, not from a `reports` endpoint.
- BE `/reports/alerts` summary mentions NCR but returns only job due date, outsourcing due date and upcoming deliveries (see BE codemap); the dashboard card "Cảnh báo quan trọng" (`ManageAlerts`) is fed by this endpoint.
- Upload is not permission-checked by BE per type, so the FE gates only through the form that hosts the field.
