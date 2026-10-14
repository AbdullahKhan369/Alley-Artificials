export const cn = (...a) => a.filter(Boolean).join(" ");

export const formatPrice = (n) =>
  "Rs. " + Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export const isOnSale = (p) =>
  p && p.sale_price != null && Number(p.sale_price) >= 0 && Number(p.sale_price) < Number(p.price);

export const finalPrice = (p) => (isOnSale(p) ? Number(p.sale_price) : Number(p.price));

export const salePercent = (p) =>
  isOnSale(p) ? Math.max(1, Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100)) : 0;

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Daraz jaisa random order, lekin ek session mein stable (har render par jump nahi karta)
export function getSessionSeed() {
  try {
    let s = sessionStorage.getItem("alley_seed");
    if (!s) {
      s = String(Math.floor(Math.random() * 1e9));
      sessionStorage.setItem("alley_seed", s);
    }
    return Number(s);
  } catch {
    return 12345;
  }
}

export function seededShuffle(arr, seed) {
  const a = [...arr];
  let t = seed >>> 0;
  const rnd = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const cleanPhone = (v) => String(v || "").replace(/[^\d]/g, "");

export const waLink = (number, text) =>
  `https://wa.me/${cleanPhone(number)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
