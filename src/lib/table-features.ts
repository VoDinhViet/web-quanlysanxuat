import { columnVisibilityFeature, tableFeatures } from "@tanstack/react-table"

// Every table in the app renders through `row.getVisibleCells()`, which v9 gates behind
// `columnVisibilityFeature` even though no table here actually toggles column visibility. No
// table uses any other v9 feature (sorting/filtering/pagination/grouping/selection/pinning are
// all server-driven via URL search params, not client row models — see forms-and-ui.md). Share
// one registry so every `createColumnHelper<typeof appTableFeatures, X>()` and
// `useTable({..., features: appTableFeatures})` pairing across the app stays structurally
// identical, instead of each table constructing its own `tableFeatures({...})`.
export const appTableFeatures = tableFeatures({ columnVisibilityFeature })
