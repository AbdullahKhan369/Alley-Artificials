import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { useAdminData } from "./adminData";
import { Card, PageHeader } from "./adminUi";
import { Button, ConfirmDialog, Field, Input, PriceTag, Select, Textarea, Toggle, useToast } from "../components/ui";
import { compressImage, removeImages, uploadImage } from "../lib/images";
import { createCategory, createProduct, deleteProduct, updateProduct } from "../lib/api";
import { cn, isOnSale } from "../lib/utils";

const MAX_IMAGES = 8;

const initForm = (p) => ({
  title: p?.title || "",
  description: p?.description || "",
  category_id: p?.category_id || "",
  subcategory_id: p?.subcategory_id || "",
  price: p ? String(p.price) : "",
  sale_price: p?.sale_price != null ? String(p.sale_price) : "",
  colors: (p?.colors || []).join(", "),
  in_stock: p ? p.in_stock : true,
  is_active: p ? p.is_active : true,
  is_featured: p ? p.is_featured : false,
});

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const toast = useToast();
  const { products, tops, subsOf, reload, removeProduct } = useAdminData();
  const existing = products.find((p) => p.id === id);

  const [form, setForm] = useState(() => initForm(existing));
  // items: purani (existing) aur nayi (new, abhi sirf browser mein) photos. Upload sirf Save par hota hai.
  const [items, setItems] = useState(() => (existing?.images || []).map((im) => ({ key: im.path || im.url, kind: "existing", ...im })));
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newSub, setNewSub] = useState({ open: false, name: "", busy: false });
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subs = useMemo(() => (form.category_id ? subsOf(form.category_id) : []), [form.category_id, subsOf]);

  if (!isNew && !existing) {
    return (
      <div className="grid justify-items-center gap-4 py-16 text-center">
        <h1 className="text-4xl">Product not found</h1>
        <Button as={Link} to="/admin/products">Back to products</Button>
      </div>
    );
  }

  /* ---------- photos ---------- */
  const addFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return toast("Please choose image files (JPG, PNG or WebP)", "error");
    const room = MAX_IMAGES - items.length;
    if (room <= 0) return toast(`You can add up to ${MAX_IMAGES} photos`, "error");
    setProcessing(true);
    try {
      const out = [];
      for (const f of files.slice(0, room)) {
        const c = await compressImage(f);
        out.push({ key: crypto.randomUUID(), kind: "new", blob: c.blob, ext: c.ext, w: c.w, h: c.h, url: URL.createObjectURL(c.blob) });
      }
      setItems((x) => [...x, ...out]);
      if (files.length > room) toast(`Only ${room} more photo${room > 1 ? "s" : ""} fit. Max is ${MAX_IMAGES}.`, "error");
    } catch (e) {
      toast(e.message || "Could not read that image", "error");
    } finally {
      setProcessing(false);
    }
  };
  const removeItem = (key) => setItems((x) => x.filter((i) => i.key !== key)); // storage se tab hi delete hoga jab Save ho
  const makeCover = (key) => setItems((x) => [x.find((i) => i.key === key), ...x.filter((i) => i.key !== key)]);

  /* ---------- pricing helpers ---------- */
  const priceNum = Number(form.price);
  const saleNum = form.sale_price === "" ? null : Number(form.sale_price);
  const applyPct = (pct) => priceNum > 0 && setForm((f) => ({ ...f, sale_price: String(Math.round(priceNum * (1 - pct / 100))) }));
  const preview = { price: priceNum || 0, sale_price: saleNum };

  /* ---------- sub-category on the fly ---------- */
  const addSub = async () => {
    const name = newSub.name.trim();
    if (!name || !form.category_id) return;
    setNewSub((s) => ({ ...s, busy: true }));
    try {
      const c = await createCategory({ name, parent_id: form.category_id, sort_order: subs.length + 1 });
      await reload();
      setForm((f) => ({ ...f, subcategory_id: c.id }));
      setNewSub({ open: false, name: "", busy: false });
      toast("Sub-category added");
    } catch (e) {
      toast(e.message, "error");
      setNewSub((s) => ({ ...s, busy: false }));
    }
  };

  /* ---------- save ---------- */
  const validate = () => {
    const e = {};
    if (form.title.trim().length < 2) e.title = "Give the product a name";
    if (!form.category_id) e.category_id = "Choose a category";
    if (!(priceNum > 0)) e.price = "Enter the regular price";
    if (saleNum != null && !(saleNum >= 0 && saleNum < priceNum)) e.sale_price = "Sale price must be lower than the regular price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast("Please fix the highlighted fields", "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    const uploadedPaths = [];
    try {
      const finalImages = [];
      for (const it of items) {
        if (it.kind === "existing") finalImages.push({ url: it.url, path: it.path, w: it.w, h: it.h });
        else {
          const up = await uploadImage(it);
          uploadedPaths.push(up.path);
          finalImages.push({ url: up.url, path: up.path, w: it.w, h: it.h });
        }
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.category_id,
        subcategory_id: form.subcategory_id || null,
        price: Math.round(priceNum),
        sale_price: saleNum == null ? null : Math.round(saleNum),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        images: finalImages,
        in_stock: form.in_stock,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };
      if (isNew) await createProduct(payload);
      else await updateProduct(id, payload);

      // DB save ho gaya, ab hi hataayi gayi photos storage se delete hoti hain
      const keep = new Set(finalImages.map((i) => i.path));
      await removeImages((existing?.images || []).map((i) => i.path).filter((p) => p && !keep.has(p)));
      await reload();
      toast(isNew ? "Product added" : "Changes saved");
      nav("/admin/products");
    } catch (e) {
      await removeImages(uploadedPaths); // aadha upload hua ho to saaf kar do
      toast(e.message || "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setSaving(true);
    try {
      await deleteProduct(existing);
      removeProduct(existing.id);
      toast("Product deleted");
      nav("/admin/products");
    } catch (e) {
      toast(e.message, "error");
      setSaving(false);
    }
  };

  return (
    <>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-2 text-[15px] text-olive hover:underline"><ArrowLeft className="size-4" /> All products</Link>
      <PageHeader title={isNew ? "Add a product" : "Edit product"} sub="Fill the boxes below, then press Save at the bottom. Nothing goes live until you save." />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <Card title="Photos" hint={`Add up to ${MAX_IMAGES}. The first photo is the cover. Big photos are made smaller automatically.`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((it, i) => (
                <div key={it.key} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-sand">
                  <img src={it.url} alt="" className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-olive px-2.5 py-1 text-xs text-cream">Cover</span>}
                  <button type="button" onClick={() => removeItem(it.key)} aria-label="Remove photo" className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-cream/95 text-rose shadow-soft hover:bg-white"><X className="size-4" /></button>
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(it.key)} className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 rounded-full bg-cream/95 py-1.5 text-xs font-medium text-olive shadow-soft hover:bg-white"><Star className="size-3.5" /> Make cover</button>
                  )}
                </div>
              ))}
              {items.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  className={cn("flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-olive transition", dragOver ? "border-olive bg-olive/5" : "border-line bg-cream hover:border-olive/50")}
                >
                  {processing ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
                  <span className="px-2 text-center text-sm">{processing ? "Preparing..." : "Add photos"}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </Card>

          <Card title="Basic details">
            <div className="grid gap-5">
              <Field label="Product name" required error={errors.title}>
                <Input value={form.title} onChange={set("title")} placeholder="e.g. Ivory Rose Bridal Bouquet" />
              </Field>
              <Field label="Description" hint="Size, material, what is included. Press Enter for a new line.">
                <Textarea rows={5} value={form.description} onChange={set("description")} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Category" required error={errors.category_id}>
                  <Select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: "" }))}>
                    <option value="">Choose a category</option>
                    {tops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Sub-category (optional)">
                  <Select value={form.subcategory_id} onChange={set("subcategory_id")} disabled={!form.category_id}>
                    <option value="">{form.category_id ? "No sub-category" : "Choose a category first"}</option>
                    {subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
              </div>
              {form.category_id && (
                <div>
                  {!newSub.open ? (
                    <Button variant="ghost" size="sm" icon={Plus} onClick={() => setNewSub({ open: true, name: "", busy: false })}>New sub-category</Button>
                  ) : (
                    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-sand/60 p-4">
                      <Field label="New sub-category name" className="min-w-52 flex-1">
                        <Input autoFocus value={newSub.name} onChange={(e) => setNewSub((s) => ({ ...s, name: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSub(); } }} placeholder="e.g. Necklace sets" />
                      </Field>
                      <Button loading={newSub.busy} onClick={addSub}>Add</Button>
                      <Button variant="soft" onClick={() => setNewSub({ open: false, name: "", busy: false })}>Cancel</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Price and sale" hint="To put this product on sale, type the new lower price. The old price shows cut, with a % off badge.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Regular price (Rs.)" required error={errors.price}>
                <Input inputMode="numeric" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, "") }))} placeholder="7350" />
              </Field>
              <Field label="Sale price (Rs.), leave empty if not on sale" error={errors.sale_price}>
                <Input inputMode="numeric" value={form.sale_price} onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value.replace(/\D/g, "") }))} placeholder="5145" />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-mute">Quick discount:</span>
              {[10, 20, 30, 40, 50].map((p) => (
                <Button key={p} size="sm" variant="soft" onClick={() => applyPct(p)} disabled={!(priceNum > 0)}>{p}% off</Button>
              ))}
              {form.sale_price !== "" && <Button size="sm" variant="dangerSoft" onClick={() => setForm((f) => ({ ...f, sale_price: "" }))}>Remove sale</Button>}
            </div>
          </Card>

          <Card title="Options">
            <div className="grid gap-4">
              <Field label="Colors (optional)" hint="Separate with commas. Customers pick one when ordering, and can filter by color.">
                <Input value={form.colors} onChange={set("colors")} placeholder="Ivory, Blush, Sage" />
              </Field>
              <Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Show on website" hint="Turn off to hide it without deleting." />
              <Toggle checked={form.in_stock} onChange={(v) => setForm((f) => ({ ...f, in_stock: v }))} label="In stock" hint="Turn off to show a Sold out label." />
              <Toggle checked={form.is_featured} onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} label="Featured" hint="Marks it in your product list." />
            </div>
          </Card>

          {!isNew && (
            <div className="rounded-3xl border border-rose/30 bg-rose/5 p-5">
              <p className="text-base font-medium text-rose">Delete this product</p>
              <p className="mt-1 text-[15px] text-ink/70">This removes the product and its photos for good.</p>
              <Button className="mt-4" variant="danger" icon={Trash2} onClick={() => setConfirmDel(true)}>Delete product</Button>
            </div>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-8 rounded-3xl border border-line bg-ivory p-4 shadow-soft">
            <p className="mb-3 text-sm font-medium text-mute">How it looks on the website</p>
            <div className="overflow-hidden rounded-2xl bg-cream shadow-soft">
              <div className="aspect-[4/5] bg-sand">{items[0] && <img src={items[0].url} alt="" className="size-full object-cover" />}</div>
              <div className="p-4">
                <p className="line-clamp-2 font-display text-2xl leading-tight">{form.title || "Product name"}</p>
                <PriceTag product={preview} size="sm" className="mt-2" />
                {isOnSale(preview) && <p className="mt-2 text-xs text-olive-soft">On sale</p>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3.5 backdrop-blur lg:left-72">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 lg:pr-6">
          <Button as={Link} to="/admin/products" variant="soft" size="lg">Cancel</Button>
          <Button size="lg" loading={saving} disabled={processing} onClick={save}>{isNew ? "Save product" : "Save changes"}</Button>
        </div>
      </div>

      <ConfirmDialog open={confirmDel} onClose={() => setConfirmDel(false)} loading={saving} onConfirm={doDelete} title="Delete this product?" message="The product and all its photos will be removed permanently." />
    </>
  );
}
