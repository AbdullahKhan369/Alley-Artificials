import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { ProductGrid, GridSkeleton } from "../components/shop/ProductCard";
import FilterPanel, { SORTS } from "../components/shop/FilterPanel";
import { Button, Chip, EmptyState, Modal, Select } from "../components/ui";
import { finalPrice, isOnSale } from "../lib/utils";
import { usePageTitle } from "../lib/usePageTitle";
import NotFound from "./NotFound";

const PAGE = 24;

export default function Shop({ mode }) {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const { products, shuffled, catBySlug, catById, subsOf, status, openOrder } = useShop();
  const [visible, setVisible] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  // ---- category / sub-category resolve ----
  const cat = mode === "category" ? catBySlug[slug] : null;
  const top = cat ? (cat.parent_id ? catById[cat.parent_id] : cat) : null;
  const subs = top ? subsOf(top.id) : [];
  const activeSub = subs.find((s) => s.slug === sp.get("sub")) || null;

  // ---- filters URL mein rehte hain (share / back button sahi chalta hai) ----
  const f = {
    sort: sp.get("sort") || (mode === "all" || mode === "sale" ? "recommended" : "newest"),
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    colors: sp.get("color") ? sp.get("color").split(",") : [],
    sale: sp.get("sale") === "1",
    stock: sp.get("stock") === "1",
    q: sp.get("q") || "",
  };
  const setF = (patch) => {
    const next = new URLSearchParams(sp);
    const map = { sort: "sort", min: "min", max: "max", q: "q" };
    Object.entries(patch).forEach(([k, v]) => {
      if (map[k]) v ? next.set(map[k], v) : next.delete(map[k]);
      if (k === "colors") v.length ? next.set("color", v.join(",")) : next.delete("color");
      if (k === "sale") v ? next.set("sale", "1") : next.delete("sale");
      if (k === "stock") v ? next.set("stock", "1") : next.delete("stock");
    });
    setSp(next, { replace: true });
  };
  const setSub = (s) => {
    const next = new URLSearchParams(sp);
    s ? next.set("sub", s.slug) : next.delete("sub");
    setSp(next, { replace: true });
  };
  const clearAll = () => {
    const next = new URLSearchParams();
    if (sp.get("sub")) next.set("sub", sp.get("sub"));
    setSp(next, { replace: true });
  };

  // ---- data ----
  const scope = useMemo(() => {
    if (mode === "sale") return products.filter(isOnSale);
    if (mode === "category" && top) return products.filter((p) => p.category_id === top.id);
    return products;
  }, [mode, products, top]);

  const inSub = useMemo(() => (activeSub ? scope.filter((p) => p.subcategory_id === activeSub.id) : scope), [scope, activeSub]);

  const colors = useMemo(() => [...new Set(inSub.flatMap((p) => p.colors || []))].sort(), [inSub]);
  const priceBounds = useMemo(() => {
    const prices = inSub.map(finalPrice);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const step = max > 20000 ? 5000 : max > 5000 ? 2000 : 1000;
    const presets = [
      { label: `Under ${step.toLocaleString("en-PK")}`, min: 0, max: step },
      { label: `${step.toLocaleString("en-PK")} to ${(step * 2).toLocaleString("en-PK")}`, min: step, max: step * 2 },
      { label: `Over ${(step * 2).toLocaleString("en-PK")}`, min: step * 2, max: 0 },
    ];
    return { min, max, presets };
  }, [inSub]);

  const rank = useMemo(() => new Map(shuffled.map((p, i) => [p.id, i])), [shuffled]);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const min = Number(f.min) || 0;
    const max = Number(f.max) || Infinity;
    let r = inSub.filter((p) => {
      const price = finalPrice(p);
      if (q && !`${p.title} ${p.description || ""}`.toLowerCase().includes(q)) return false;
      if (price < min || price > max) return false;
      if (f.colors.length && !(p.colors || []).some((c) => f.colors.includes(c))) return false;
      if (f.sale && !isOnSale(p)) return false;
      if (f.stock && !p.in_stock) return false;
      return true;
    });
    if (f.sort === "recommended") r = [...r].sort((a, b) => rank.get(a.id) - rank.get(b.id));
    else if (f.sort === "price-asc") r = [...r].sort((a, b) => finalPrice(a) - finalPrice(b));
    else if (f.sort === "price-desc") r = [...r].sort((a, b) => finalPrice(b) - finalPrice(a));
    else r = [...r].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inSub, f.q, f.min, f.max, f.colors.join(), f.sale, f.stock, f.sort, rank]);

  const filterSig = sp.toString() + slug + mode;
  useEffect(() => setVisible(PAGE), [filterSig]);

  const activeCount = (f.min ? 1 : 0) + (f.max ? 1 : 0) + f.colors.length + (f.sale ? 1 : 0) + (f.stock ? 1 : 0) + (f.q ? 1 : 0);
  const title = mode === "sale" ? "Sale" : mode === "category" ? cat?.name : f.q ? `Results for "${f.q}"` : "All pieces";
  usePageTitle(title);

  if (status === "ready" && mode === "category" && !cat) return <NotFound />;
  // /category/<sub-slug> ko parent page + ?sub= par bhej dete hain
  if (cat?.parent_id && top) return <Navigate to={`/category/${top.slug}?sub=${cat.slug}`} replace />;

  const filterProps = { f, setF, colors, priceBounds, onClear: clearAll, activeCount, showSaleToggle: mode !== "sale" };

  return (
    <div className="container-x pb-10 pt-6 md:pt-10">
      <header className="mb-8 max-w-3xl">
        <nav className="mb-3 text-sm text-mute" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-olive">Home</Link> / <Link to="/shop" className="hover:text-olive">Shop</Link>
          {top && <> / <Link to={`/category/${top.slug}`} className="hover:text-olive">{top.name}</Link></>}
          {activeSub && <> / <span className="text-olive">{activeSub.name}</span></>}
        </nav>
        <h1 className="text-5xl md:text-6xl">{activeSub ? activeSub.name : title}</h1>
        <p className="mt-3 text-[15px] text-mute">
          {status === "ready" ? `${list.length} ${list.length === 1 ? "piece" : "pieces"}` : "Loading"}
          {mode === "all" && !f.q && " in a fresh mix each visit"}
        </p>
      </header>

      {subs.length > 0 && (
        <div className="hide-scrollbar -mx-5 mb-6 flex gap-2.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <Chip active={!activeSub} onClick={() => setSub(null)} count={scope.length}>
            All {top.name}
          </Chip>
          {subs.map((s) => (
            <Chip key={s.id} active={activeSub?.id === s.id} onClick={() => setSub(s)} count={scope.filter((p) => p.subcategory_id === s.id).length}>
              {s.name}
            </Chip>
          ))}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
        <Button variant="outline" size="sm" icon={SlidersHorizontal} onClick={() => setSheet(true)}>
          Filters{activeCount ? ` (${activeCount})` : ""}
        </Button>
        <div className="w-48">
          <Select aria-label="Sort" value={f.sort} onChange={(e) => setF({ sort: e.target.value })} className="py-2.5 text-sm">
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>{s.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {f.q && (
        <button onClick={() => setF({ q: "" })} className="mb-5 inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm text-olive">
          Search: {f.q} <X className="size-4" />
        </button>
      )}

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100svh-9rem)] overflow-y-auto pr-2 hide-scrollbar">
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        <section aria-live="polite">
          {status === "loading" && <GridSkeleton />}
          {status === "error" && <EmptyState icon={SearchX} title="Could not load products" text="Check your internet and try again." />}
          {status === "ready" && list.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Nothing matches yet"
              text={activeCount ? "Try removing a filter to see more pieces." : "New pieces are coming soon. You can also ask us to make something just for you."}
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {activeCount > 0 && <Button variant="soft" onClick={clearAll}>Clear filters</Button>}
                  <Button onClick={() => openOrder(null)}>Custom order</Button>
                </div>
              }
            />
          )}
          {status === "ready" && list.length > 0 && (
            <motion.div key={filterSig} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <ProductGrid items={list.slice(0, visible)} />
              {visible < list.length && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE)}>
                    Show more ({list.length - visible} left)
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </section>
      </div>

      <Modal
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filters"
        footer={<Button className="w-full" onClick={() => setSheet(false)}>Show {list.length} pieces</Button>}
      >
        <FilterPanel {...filterProps} />
      </Modal>
    </div>
  );
}
