<!-- Generated: 2026-10-16 | Files scanned: 11 codemaps + extractor join of 270 server fns / 306 BE routes / 125 route files | Token estimate: ~1200 -->
# Web codemaps index

Entry point for tracing the web app (TanStack Start). A codemap is a map; the code is the source of truth. If they disagree, trust the code and fix the codemap.

## How to read
1. Know the screen or the business term? Find the domain in the table and open its codemap.
2. In the domain codemap follow: Screens (URL -> route file -> page), Actions -> endpoints (button -> server fn -> `METHOD /api/...` -> permission -> BE handler `file:line`), UI state flow, Gaps.
3. For the BE side of an endpoint open the same-named file in `be-quanlysanxuat/docs/CODEMAPS/` (routes, service lines, tables, error codes).
4. For a chain across several domains (SO -> LSX -> JOB -> OQC -> NCR, PR -> RFQ -> DMH -> receipt) open `system-flow.md`.
5. Cross-cutting questions (auth, 401/refresh, route guard, loader pattern, file layout) are in `architecture.md`; the full URL tree is in `routes.md`.

## Codemaps
| File | Covers |
|---|---|
| `architecture.md` | entry points, `createServerFn` trust boundary, `src/lib/http.ts`, session/token, route guard, loader -> options -> server fn flow, forms/tables, "add a screen" checklist |
| `routes.md` | every route file: URL, page/layout, feature, loader preloads, permission gate |
| `system-flow.md` | cross-stack chains with UI button, server fn, endpoint, service, tables, status change, blocking error codes; section 7 lists disagreements between BE codemap, code, FE and `ui-flow.md` |
| `sales.md` | orders (SO), outbound-orders (DO), clients (+client-groups), countries |
| `purchasing.md` | purchase-requests, purchase-quotations (RFQ), purchase-orders (DMH), purchase-ledger, payment-requests, suppliers (+supplier-groups) |
| `inventory.md` | inventory-receipts, inventory-issues, inventory-requisitions, inventory-adjustments (no UI), inventory-products, inventory-directs, supplier-returns |
| `product-structure.md` | products (BOM/routing screens), directs, units, operations; item-units has no UI |
| `production.md` | production-orders (LSX), production-jobs (JOB), production-execution, outsourcing-orders, outsourcing-receipts |
| `quality.md` | iqc, oqc, ncrs (OQC Fail -> Sort -> NCR -> secondary LSX -> re-OQC from the UI side) |
| `identity-access.md` | auth/session, users, roles, departments, positions, permission model in the UI |
| `integration.md` | reports (dashboard), file upload/download path, `/api/v1/integration/*` (external only, no FE caller) |

## Naming traps
- FE feature folders differ from BE domains: BE `items` is FE `products` (type FG) and `directs` (type DIRECT); `production-jobs` server fns also call `production-execution`; `auth` calls BE `auth` and `users`; `departments` calls `departments` and `positions`.
- FE `getItemIssues` / `ItemIssue` is rolled-up DIRECT requirements per item, not `inventory-issues`.
- Route folders ending `_` (`orders_/$orderId`) escape layout nesting; URLs drop the `(authed)` / `manage_` group syntax.
- BE `file:line` in the FE codemaps is the handler method line. BE codemaps use their own per-file convention (handler line, decorator line, service line); each file states which.

## Glossary
Same as `be-quanlysanxuat/docs/CODEMAPS/INDEX.md`: SO sales order, LSX production order, JOB production job, DMH supplier purchase order, DO outbound delivery, PXK goods issue note, IQC/OQC incoming/outgoing quality check, NCR non-conformance report, RFQ quotation request, OS-OUT/OS-IN outsourcing send/receive.

## Related
- `docs/ui-flow.md`: screen <-> button <-> status diagrams for the three main chains (parts are stale; `system-flow.md` section 7 lists the known disagreements).
- Workspace entry: `../../CODEMAP.md`.

## Maintenance
When a change adds or edits a route, a server function, a permission gate or a status-driven button, update the matching codemap and refresh its `Generated:` header (`/ecc:update-codemaps` helps). Rule is in `.claude/rules/workflow.md`.
