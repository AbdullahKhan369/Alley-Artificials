import { Button, Chip, Input } from "../ui";
import { cn } from "../../lib/utils";

export const SORTS = [
  { v: "recommended", label: "Recommended" },
  { v: "newest", label: "Newest first" },
  { v: "price-asc", label: "Price: low to high" },
  { v: "price-desc", label: "Price: high to low" },
];

// Sidebar (desktop) aur bottom sheet (mobile) dono isi ko use karte hain
export default function FilterPanel({ f, setF, colors, priceBounds, onClear, activeCount, showSaleToggle = true }) {
  return (
    <div className="grid gap-7">
      <section>
        <h3 className="mb-3 font-display text-2xl">Sort by</h3>
        <div className="grid gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.v}
              onClick={() => setF({ sort: s.v })}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition", f.sort === s.v ? "bg-olive text-cream" : "text-ink hover:bg-sand")}
            >
              <span className={cn("size-2 rounded-full", f.sort === s.v ? "bg-gold" : "bg-line")} />
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-2xl">Price (Rs.)</h3>
        <div className="flex items-center gap-2">
          <Input inputMode="numeric" aria-label="Minimum price" placeholder={String(priceBounds.min)} value={f.min} onChange={(e) => setF({ min: e.target.value.replace(/\D/g, "") })} />
          <span className="text-mute">to</span>
          <Input inputMode="numeric" aria-label="Maximum price" placeholder={String(priceBounds.max)} value={f.max} onChange={(e) => setF({ max: e.target.value.replace(/\D/g, "") })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {priceBounds.presets.map((p) => (
            <Chip key={p.label} active={String(f.min) === String(p.min) && String(f.max) === String(p.max)} onClick={() => setF({ min: String(p.min || ""), max: String(p.max || "") })}>
              {p.label}
            </Chip>
          ))}
        </div>
      </section>

      {colors.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-2xl">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <Chip key={c} active={f.colors.includes(c)} onClick={() => setF({ colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c] })}>
                {c}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 font-display text-2xl">Availability</h3>
        <div className="flex flex-wrap gap-2">
          {showSaleToggle && (
            <Chip active={f.sale} onClick={() => setF({ sale: !f.sale })}>
              On sale
            </Chip>
          )}
          <Chip active={f.stock} onClick={() => setF({ stock: !f.stock })}>
            In stock
          </Chip>
        </div>
      </section>

      {activeCount > 0 && (
        <Button variant="soft" onClick={onClear}>
          Clear all filters ({activeCount})
        </Button>
      )}
    </div>
  );
}
