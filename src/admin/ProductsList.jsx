import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAdminData } from "./adminData";
import { PageHeader, StatusPill, Thumb } from "./adminUi";
import { Button, ConfirmDialog, EmptyState, Input, PriceTag, Select, useToast } from "../components/ui";
import { deleteProduct, updateProduct } from "../lib/api";
import { isOnSale } from "../lib/utils";

export default function ProductsList() {
  const { products, tops, catById, patchProduct, removeProduct } = useAdminData();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [state, setState] = useState("");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => {
      if (s && !p.title.toLowerCase().includes(s)) return false;
      if (cat && p.category_id !== cat) return false;
      if (state === "sale" && !isOnSale(p)) return false;
      if (state === "hidden" && p.is_active) return false;
      if (state === "sold" && p.in_stock) return false;
      return true;
    });
  }, [products, q, cat, state]);

  const toggle = async (p, field) => {
    try {
      const next = await updateProduct(p.id, { [field]: !p[field] });
      patchProduct(next);
      toast(field === "is_active" ? (next.is_active ? "Now visible on website" : "Hidden from website") : next.in_stock ? "Marked in stock" : "Marked sold out");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteProduct(del);
      removeProduct(del.id);
      toast("Product deleted");
      setDel(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Products" sub={`${products.length} in total. Tap Edit on any product to change photos, price or details.`} actions={<Button as={Link} to="/admin/products/new" size="lg" icon={Plus}>Add product</Button>} />

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_14rem_12rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="pl-12" aria-label="Search products" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {tops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={state} onChange={(e) => setState(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="sale">On sale</option>
          <option value="hidden">Hidden</option>
          <option value="sold">Sold out</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Package} title={products.length ? "No product matches" : "Add your first product"} text={products.length ? "Try a different search or filter." : "Upload photos, set a price and it appears on your website right away."} action={!products.length && <Button as={Link} to="/admin/products/new" size="lg" icon={Plus}>Add product</Button>} />
      ) : (
        <ul className="grid gap-3">
          {rows.map((p) => {
            const c = catById[p.category_id];
            const s = catById[p.subcategory_id];
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-ivory p-4 shadow-soft">
                <Thumb product={p} className="size-20 md:size-24" />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-display text-2xl text-olive-deep">{p.title}</p>
                  <p className="text-sm text-mute">{c ? c.name : "No category"}{s ? ` / ${s.name}` : ""}</p>
                  <PriceTag product={p} size="sm" className="mt-1.5" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!p.is_active && <StatusPill tone="bad">Hidden</StatusPill>}
                    {!p.in_stock && <StatusPill tone="warn">Sold out</StatusPill>}
                    {p.is_featured && <StatusPill tone="good">Featured</StatusPill>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button as={Link} to={`/admin/products/${p.id}`} variant="soft" icon={Pencil}>Edit</Button>
                  <Button variant="ghost" icon={p.is_active ? EyeOff : Eye} onClick={() => toggle(p, "is_active")} aria-label={p.is_active ? "Hide from website" : "Show on website"}>{p.is_active ? "Hide" : "Show"}</Button>
                  <Button variant="dangerSoft" icon={Trash2} onClick={() => setDel(p)} aria-label={`Delete ${p.title}`}>Delete</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} loading={busy} onConfirm={confirmDelete} title="Delete this product?" message={del ? `"${del.title}" and its photos will be removed permanently. If you only want to take it off the website for a while, use Hide instead.` : ""} />
    </>
  );
}
