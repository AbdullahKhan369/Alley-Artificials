import { useMemo, useState } from "react";
import { BadgePercent, Check, Search, X } from "lucide-react";
import { useAdminData } from "./adminData";
import { Card, PageHeader, Thumb } from "./adminUi";
import { Button, Chip, EmptyState, Input, useToast } from "../components/ui";
import { setSalePrice } from "../lib/api";
import { cn, formatPrice, isOnSale, salePercent } from "../lib/utils";

function Row({ p, checked, onCheck }) {
  const { patchProduct } = useAdminData();
  const toast = useToast();
  const [val, setVal] = useState(p.sale_price != null ? String(p.sale_price) : "");
  const [busy, setBusy] = useState(false);
  const n = val === "" ? null : Number(val);
  const valid = n != null && n >= 0 && n < p.price;
  const dirty = String(p.sale_price ?? "") !== val;

  const save = async (next) => {
    setBusy(true);
    try {
      const updated = await setSalePrice(p.id, next);
      patchProduct(updated);
      setVal(next == null ? "" : String(next));
      toast(next == null ? "Sale removed" : "Sale saved");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-ivory p-4 shadow-soft">
      <input type="checkbox" checked={checked} onChange={onCheck} aria-label={`Select ${p.title}`} className="size-5 accent-[#3b4630]" />
      <Thumb product={p} className="size-16" />
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-display text-2xl text-olive-deep">{p.title}</p>
        <p className="text-sm text-mute">Regular price {formatPrice(p.price)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-36">
          <Input inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && valid && dirty && save(n)} placeholder="Sale price" aria-label={`Sale price for ${p.title}`} />
        </div>
        <span className={cn("w-16 text-center text-sm font-medium", valid ? "text-rose" : "text-mute")}>{valid ? `-${salePercent({ price: p.price, sale_price: n })}%` : "-"}</span>
        <Button size="sm" icon={Check} loading={busy} disabled={!valid || !dirty} onClick={() => save(n)}>Save</Button>
        {isOnSale(p) && <Button size="sm" variant="dangerSoft" icon={X} disabled={busy} onClick={() => save(null)}>Remove</Button>}
      </div>
    </li>
  );
}

export default function SalePage() {
  const { products, patchProduct } = useAdminData();
  const toast = useToast();
  const [tab, setTab] = useState("sale");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(new Set());
  const [pct, setPct] = useState("20");
  const [busy, setBusy] = useState(false);

  const onSaleCount = products.filter(isOnSale).length;
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => (tab === "all" ? true : tab === "sale" ? isOnSale(p) : !isOnSale(p)) && (!s || p.title.toLowerCase().includes(s)));
  }, [products, tab, q]);

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const chosen = products.filter((p) => sel.has(p.id));
  const pctNum = Number(pct);

  const bulk = async (mode) => {
    if (!chosen.length) return;
    if (mode === "apply" && !(pctNum > 0 && pctNum < 100)) return toast("Enter a discount between 1 and 99", "error");
    setBusy(true);
    try {
      const results = await Promise.all(chosen.map((p) => setSalePrice(p.id, mode === "apply" ? Math.round(p.price * (1 - pctNum / 100)) : null)));
      results.forEach(patchProduct);
      toast(mode === "apply" ? `${pctNum}% off applied to ${results.length} products` : `Sale removed from ${results.length} products`);
      setSel(new Set());
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Sale" sub="Type a sale price on any product, or tick many products and give them all a % discount in one go. The regular price shows cut on the website with a % off badge." />

      <Card title="Discount many products together" hint="Tick products in the list below, choose a percentage, then press Apply." className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-28"><Input inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, "").slice(0, 2))} aria-label="Discount percent" /></div>
            <span className="text-base">% off</span>
          </div>
          {[10, 20, 30, 40, 50].map((n) => <Button key={n} size="sm" variant="soft" onClick={() => setPct(String(n))}>{n}%</Button>)}
          <Button icon={BadgePercent} loading={busy} disabled={!chosen.length} onClick={() => bulk("apply")}>Apply to {chosen.length || ""} selected</Button>
          <Button variant="dangerSoft" disabled={!chosen.length || busy} onClick={() => bulk("remove")}>Remove sale from selected</Button>
        </div>
      </Card>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Chip active={tab === "sale"} onClick={() => setTab("sale")} count={onSaleCount}>On sale</Chip>
        <Chip active={tab === "regular"} onClick={() => setTab("regular")} count={products.length - onSaleCount}>Not on sale</Chip>
        <Chip active={tab === "all"} onClick={() => setTab("all")} count={products.length}>All</Chip>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-12" aria-label="Search" />
        </div>
      </div>

      {rows.length > 0 && (
        <label className="mb-3 flex w-fit cursor-pointer items-center gap-3 text-[15px] text-olive">
          <input type="checkbox" checked={allSelected} onChange={() => setSel(allSelected ? new Set() : new Set(rows.map((r) => r.id)))} className="size-5 accent-[#3b4630]" />
          Select all {rows.length} shown
        </label>
      )}

      {rows.length === 0 ? (
        <EmptyState icon={BadgePercent} title={tab === "sale" ? "Nothing on sale yet" : "No products here"} text={tab === "sale" ? "Open the Not on sale tab, tick products and apply a discount." : "Try a different search."} />
      ) : (
        <ul className="grid gap-3">{rows.map((p) => <Row key={p.id + String(p.sale_price)} p={p} checked={sel.has(p.id)} onCheck={() => toggle(p.id)} />)}</ul>
      )}
    </>
  );
}
