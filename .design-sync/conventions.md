# QLSX Tiến Huy UI — build conventions

Internal manufacturing ERP ("Cơ khí Tiến Huy"). **All user-visible text is Vietnamese** — labels, buttons, empty states, table headers (e.g. "Tạo lệnh sản xuất", "Xuất Excel", "Hủy"). Realistic domain content: production orders, products, materials, users.

## Setup

No provider is required. Components read design tokens from CSS variables defined in `styles.css`; it also loads the Geist Variable font (Vietnamese subset included). Dark mode = add the `dark` class to a root element — every token flips via `.dark` overrides. The sidebar (`Sidebar`, `bg-sidebar`) is dark navy in **both** themes; don't restyle it light.

## Styling idiom — Tailwind utilities on semantic tokens only

Layout glue is Tailwind CSS v4 utility classes. Color must come from the semantic token families below — never raw palette utilities (`bg-blue-500`, `text-gray-600`):

| Family | Utilities |
| --- | --- |
| Surfaces | `bg-background text-foreground`, `bg-card text-card-foreground`, `bg-popover text-popover-foreground`, `bg-muted text-muted-foreground` |
| Actions | `bg-primary text-primary-foreground` (brand blue), `bg-secondary text-secondary-foreground`, `bg-accent text-accent-foreground`, `bg-destructive`, `text-destructive` |
| Lines & focus | `border-border`, `border-input`, `ring-ring` |
| Sidebar | `bg-sidebar text-sidebar-foreground`, `bg-sidebar-primary`, `bg-sidebar-accent`, `border-sidebar-border` |
| Charts | `--chart-1` … `--chart-5` (use via `ChartContainer` config) |
| Radius | `rounded-sm/md/lg/xl` — all derived from `--radius: 0.45rem`; `rounded-lg` is the default card/control radius |
| Type | `font-sans` (Geist Variable) — the only family; headings differ by size/weight, not typeface |

Component look-and-feel (variants, sizes, tones) comes from **props** on the components (`variant="outline"`, `size="sm"`), not custom classes — reach for a variant before writing utilities.

## Where the truth lives

- `styles.css` — every token (`:root` and `.dark` blocks) and the Tailwind theme mapping.
- `components/<group>/<Name>/<Name>.d.ts` — the exact props API; `<Name>.prompt.md` — usage notes and composition examples.
- All components live on the `QlsxUI` global: forms (`Field`, `Input`, `Select`, `Combobox`, `DatePickerField`, `Checkbox`, `Switch`), data (`Table`, `Card`, `Badge`, `Empty`, `Pagination`), overlays (`Dialog`, `Sheet`, `DropdownMenu`, `Tooltip`), navigation (`Sidebar`, `Tabs`, `Breadcrumb`), feedback (`Alert`, `Spinner`, `Skeleton`, `Progress`, `Toaster`).

## Idiomatic example

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle, Field, FieldLabel, Input } from "web-qlsx-start"

export const ProductForm = () => (
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Thêm sản phẩm</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="product-name">Tên sản phẩm</FieldLabel>
        <Input id="product-name" placeholder="Trục cán thép D200" />
      </Field>
      <div className="flex justify-end gap-3">
        <Button variant="outline">Hủy</Button>
        <Button>Lưu sản phẩm</Button>
      </div>
    </CardContent>
  </Card>
)
```

Icon-only buttons take `aria-label` (see `IconButton`); form inputs pair `<FieldLabel htmlFor>` with the input's `id`.
