import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminData } from "./adminData";
import { Card, PageHeader } from "./adminUi";
import { Button, ConfirmDialog, Input, useToast } from "../components/ui";
import { createCategory, deleteCategory, renameCategory } from "../lib/api";

function InlineName({ cat, onDone }) {
  const [v, setV] = useState(cat.name);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const save = async () => {
    if (!v.trim() || v.trim() === cat.name) return onDone(false);
    setBusy(true);
    try {
      await renameCategory(cat.id, v);
      await onDone(true);
      toast("Name updated");
    } catch (e) {
      toast(e.message, "error");
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-1 items-center gap-2">
      <Input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onDone(false); }} aria-label="Category name" />
      <Button size="sm" loading={busy} onClick={save} icon={Check}>Save</Button>
      <Button size="sm" variant="soft" onClick={() => onDone(false)} aria-label="Cancel"><X className="size-4" /></Button>
    </div>
  );
}

function AddRow({ placeholder, onAdd, label = "Add" }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onAdd(name);
      setName("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={placeholder} aria-label={placeholder} />
      <Button loading={busy} onClick={go} icon={Plus} disabled={!name.trim()}>{label}</Button>
    </div>
  );
}

export default function Categories() {
  const { tops, subsOf, products, reload } = useAdminData();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const count = (c) => products.filter((p) => (c.parent_id ? p.subcategory_id === c.id : p.category_id === c.id)).length;
  const done = async (changed) => {
    if (changed) await reload();
    setEditing(null);
  };

  const add = (parent) => async (name) => {
    try {
      await createCategory({ name, parent_id: parent?.id || null, sort_order: parent ? subsOf(parent.id).length + 1 : tops.length + 1 });
      await reload();
      toast(parent ? "Sub-category added" : "Category added");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteCategory(del.id);
      await reload();
      toast("Deleted");
      setDel(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const delMessage = () => {
    if (!del) return "";
    const n = count(del);
    if (del.parent_id) return n ? `${n} product${n > 1 ? "s" : ""} will stay on the website but lose this sub-category.` : "This sub-category is empty, so nothing else changes.";
    const subsN = subsOf(del.id).length;
    return `This also removes its ${subsN} sub-categor${subsN === 1 ? "y" : "ies"}. ${n ? `${n} product${n > 1 ? "s" : ""} will have no category until you edit them.` : ""}`;
  };

  return (
    <>
      <PageHeader title="Categories" sub="Each main category has its own sub-categories. Customers can filter by them on the website. Changes show up right away." />
      <div className="grid gap-6">
        {tops.map((c) => {
          const subs = subsOf(c.id);
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {editing === c.id ? (
                  <InlineName cat={c} onDone={done} />
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl">{c.name}</h2>
                      <p className="text-sm text-mute">{count(c)} products, {subs.length} sub-categories</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="soft" size="sm" icon={Pencil} onClick={() => setEditing(c.id)}>Rename</Button>
                      <Button variant="dangerSoft" size="sm" icon={Trash2} onClick={() => setDel(c)} aria-label={`Delete ${c.name}`} />
                    </div>
                  </>
                )}
              </div>

              <ul className="mt-5 grid gap-2">
                {subs.length === 0 && <li className="rounded-xl bg-sand/50 px-4 py-3 text-[15px] text-mute">No sub-categories yet. Add the first one below.</li>}
                {subs.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-4 py-2.5">
                    {editing === s.id ? (
                      <InlineName cat={s} onDone={done} />
                    ) : (
                      <>
                        <span className="text-base">{s.name} <span className="text-sm text-mute">({count(s)})</span></span>
                        <span className="flex gap-1.5">
                          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(s.id)}>Rename</Button>
                          <Button variant="dangerSoft" size="sm" icon={Trash2} onClick={() => setDel(s)} aria-label={`Delete ${s.name}`} />
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <AddRow placeholder={`New sub-category in ${c.name}`} onAdd={add(c)} label="Add sub-category" />
              </div>
            </Card>
          );
        })}

        <Card title="Add another main category" hint="Most shops never need this. It appears in the website menu.">
          <AddRow placeholder="e.g. Home Decor" onAdd={add(null)} label="Add category" />
        </Card>
      </div>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} loading={busy} onConfirm={confirmDelete} title={del ? `Delete "${del.name}"?` : ""} message={delMessage()} />
    </>
  );
}
