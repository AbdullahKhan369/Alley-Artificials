import { supabase } from "./supabase";
import { removeImages } from "./images";
import { slugify } from "./utils";

const unwrap = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

/* ---------- Public reads ---------- */
export async function fetchCategories() {
  return unwrap(await supabase.from("categories").select("*").order("sort_order").order("name"));
}

export async function fetchProducts({ admin = false } = {}) {
  const PAGE = 1000;
  let all = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from("products").select("*").order("created_at", { ascending: false }).range(from, from + PAGE - 1);
    if (!admin) q = q.eq("is_active", true);
    const rows = unwrap(await q);
    all = all.concat(rows);
    if (rows.length < PAGE) break;
  }
  return all;
}

export async function fetchSettings() {
  const row = unwrap(await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle());
  return row?.data || {};
}

/* ---------- Orders ---------- */
export async function createOrder(payload) {
  const { error } = await supabase.from("orders").insert(payload);
  if (error) throw new Error(error.message);
}
export const fetchOrders = async () =>
  unwrap(await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(300));
export const updateOrderStatus = async (id, status) =>
  unwrap(await supabase.from("orders").update({ status }).eq("id", id).select().single());
export const deleteOrder = async (id) => unwrap(await supabase.from("orders").delete().eq("id", id));

/* ---------- Products (admin) ---------- */
export const createProduct = async (fields) =>
  unwrap(await supabase.from("products").insert(fields).select().single());

export const updateProduct = async (id, fields) =>
  unwrap(await supabase.from("products").update(fields).eq("id", id).select().single());

// Pehle DB row, phir storage files (taake row delete fail ho to images na jayen)
export async function deleteProduct(product) {
  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) throw new Error(error.message);
  await removeImages((product.images || []).map((i) => i.path));
}

export const setSalePrice = async (id, salePrice) =>
  unwrap(await supabase.from("products").update({ sale_price: salePrice }).eq("id", id).select().single());

/* ---------- Categories (admin) ---------- */
export async function createCategory({ name, parent_id = null, sort_order = 0 }) {
  const base = slugify(name) || "category";
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug, parent_id, sort_order })
      .select()
      .single();
    if (!error) return data;
    if (error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Could not create a unique link for this category. Try a different name.");
}

export const renameCategory = async (id, name) =>
  unwrap(await supabase.from("categories").update({ name: name.trim() }).eq("id", id).select().single());

export const deleteCategory = async (id) => unwrap(await supabase.from("categories").delete().eq("id", id));

/* ---------- Settings ---------- */
export async function saveSettings(data) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/* ---------- Auth ---------- */
export async function checkIsAdmin(uid) {
  if (!uid) return false;
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
  if (error) return false;
  return Boolean(data);
}
